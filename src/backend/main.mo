import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";
import Iter "mo:core/Iter";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ProductId = Text;
  public type OrderId = Text;

  public type Images = [Storage.ExternalBlob];

  public type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Nat;
    images : Images;
  };

  public type UserProfile = {
    name : Text;
    phoneNumber : Text;
    address : ?Text;
  };

  public type Customer = {
    name : Text;
    phoneNumber : Text;
    address : ?Text;
    principal : Principal;
  };

  public type OrderStatus = { #pendingPayment; #paid; #shipped };

  public type Order = {
    id : OrderId;
    customer : Customer;
    products : [Product];
    total : Nat;
    status : OrderStatus;
    placedTime : Int;
    paymentIntentId : ?Text;
  };

  // State
  let products = Map.empty<ProductId, Product>();
  let customers = Map.empty<Principal, Customer>();
  let orders = Map.empty<OrderId, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Stripe config stored Singleton-style
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  //--------------------------------------
  // User Profile Management (Required APIs)
  //--------------------------------------
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    switch (customers.get(caller)) {
      case (?existingCustomer) {
        let updatedCustomer : Customer = {
          name = profile.name;
          phoneNumber = profile.phoneNumber;
          address = profile.address;
          principal = caller;
        };
        customers.add(caller, updatedCustomer);
      };
      case (null) {
        let newCustomer : Customer = {
          name = profile.name;
          phoneNumber = profile.phoneNumber;
          address = profile.address;
          principal = caller;
        };
        customers.add(caller, newCustomer);
      };
    };
  };

  //--------------------------------------
  // Product Management
  //--------------------------------------

  public shared ({ caller }) func createProduct(name : Text, description : Text, price : Nat, images : Images) : async ProductId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    let newProductId = name.concat(description);

    let product : Product = {
      id = newProductId;
      name;
      description;
      price;
      images;
    };
    products.add(newProductId, product);
    newProductId;
  };

  public query func getProducts() : async [Product] {
    // Public access - anyone can browse products
    products.values().toArray();
  };

  public query func getProduct(id : ProductId) : async ?Product {
    products.get(id);
  };

  //--------------------------------------
  // Customer Management
  //--------------------------------------

  public shared ({ caller }) func createCustomer(name : Text, phoneNumber : Text, address : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create customer profiles");
    };

    let customer : Customer = {
      principal = caller;
      name;
      phoneNumber;
      address;
    };

    customers.add(caller, customer);

    // Also create default user profile
    let profile : UserProfile = {
      name;
      phoneNumber;
      address;
    };

    userProfiles.add(caller, profile);
  };

  //--------------------------------------
  // Order Management
  //--------------------------------------

  public shared ({ caller }) func createOrder(productIds : [ProductId]) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    // Validate customer exists
    let customer = switch (customers.get(caller)) {
      case (null) { Runtime.trap("Customer profile does not exist. Please create a profile first.") };
      case (?c) { c };
    };

    // Validate all products exist
    let productsArray = productIds.map(func(id) { products.get(id) });
    let foundProducts = productsArray.map(func(opt) {
      switch (opt) {
        case (null) { Runtime.trap("Product does not exist") };
        case (?product) { product };
      };
    });

    let totalPrice = foundProducts.foldLeft(0, func(acc, product) { acc + product.price });

    // Use current time as unique order id (for demo)
    let newOrderId = Time.now().toText();

    let order : Order = {
      id = newOrderId;
      customer;
      products = foundProducts;
      total = totalPrice;
      status = #pendingPayment;
      placedTime = Time.now();
      paymentIntentId = null;
    };

    orders.add(newOrderId, order);
    newOrderId;
  };

  public query ({ caller }) func getOrder(id : OrderId) : async ?Order {
    switch (orders.get(id)) {
      case (null) { null };
      case (?order) {
        if (order.customer.principal == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?order;
        } else {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
      };
    };
  };

  public query ({ caller }) func getOrdersByPrincipal(principal : Principal) : async [Order] {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    orders.values().toArray().filter(func(order) { order.customer.principal == principal });
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    orders.values().toArray().filter(func(order) { order.customer.principal == caller });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  //--------------------------------------
  // Payment Processing
  //--------------------------------------

  public shared ({ caller }) func completePayment(sessionId : Text, orderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete payments");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?o) { o };
    };

    if (order.customer.principal != caller) {
      Runtime.trap("Unauthorized: Can only complete payment for your own orders");
    };

    let status = await Stripe.getSessionStatus(syncGetStripeConfiguration(), sessionId, transform);
    switch (status) {
      case (#failed { error }) { Runtime.trap(error) };
      case (#completed { response; userPrincipal }) {
        let updatedOrder = {
          order with 
          status = #paid; 
          paymentIntentId = ?sessionId;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  //--------------------------------------
  // Stripe Configuration Management
  //--------------------------------------

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manage payment config");
    };
    stripeConfiguration := ?config;
  };

  //--------------------------------------
  // Payment Session Helper Query Functions
  //--------------------------------------

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(syncGetStripeConfiguration(), sessionId, transform);
  };

  //--------------------------------------
  // Checkout Session Creation (via Stripe)
  //--------------------------------------

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(syncGetStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  //--------------------------------------
  // Transform Function Helper (Required for Stripe + Outcalls)
  //--------------------------------------

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  //--------------------------------------
  // Internal Helpers
  //--------------------------------------

  func syncGetStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) {
        Runtime.trap("Payment processing is not configured yet");
      };
      case (?value) { value };
    };
  };
};
