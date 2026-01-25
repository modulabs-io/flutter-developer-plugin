# /flutter-database-drift

Set up Drift (formerly Moor) for local SQLite database in Flutter applications.

## Usage

```
/flutter-database-drift <command> [options]
```

## Commands

- `init`: Initialize Drift database configuration
- `table`: Create a new table definition
- `dao`: Generate Data Access Object
- `migrate`: Create or update migration

## Options

- `--name <name>`: Database or table name
- `--tables <list>`: Tables to include (comma-separated)
- `--isolate`: Enable isolate for background processing
- `--encryption`: Add database encryption support

## Examples

```
/flutter-database-drift init --name app_database
/flutter-database-drift table --name users
/flutter-database-drift dao --name user
/flutter-database-drift migrate --version 2
```

## Instructions

When the user invokes `/flutter-database-drift`, follow these steps:

### 1. Add Dependencies

```yaml
# pubspec.yaml
dependencies:
  drift: ^2.22.1
  sqlite3_flutter_libs: ^0.5.28
  path_provider: ^2.1.5
  path: ^1.9.0

dev_dependencies:
  drift_dev: ^2.22.1
  build_runner: ^2.4.13
```

```bash
flutter pub get
```

### 2. Project Structure

```
lib/
├── core/
│   └── database/
│       ├── app_database.dart          # Main database class
│       ├── app_database.g.dart        # Generated code
│       ├── tables/
│       │   ├── users_table.dart
│       │   ├── products_table.dart
│       │   └── orders_table.dart
│       ├── daos/
│       │   ├── user_dao.dart
│       │   ├── product_dao.dart
│       │   └── order_dao.dart
│       └── converters/
│           └── datetime_converter.dart
```

### 3. Table Definitions

**lib/core/database/tables/users_table.dart**:
```dart
import 'package:drift/drift.dart';

class Users extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get email => text().unique()();
  TextColumn get name => text().withLength(min: 1, max: 100)();
  TextColumn get avatarUrl => text().nullable()();
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().nullable()();

  // Composite index
  @override
  List<Set<Column>>? get uniqueKeys => [
        {email},
      ];
}
```

**lib/core/database/tables/products_table.dart**:
```dart
import 'package:drift/drift.dart';

@DataClassName('Product')
class Products extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().withLength(min: 1, max: 200)();
  TextColumn get description => text().nullable()();
  RealColumn get price => real()();
  IntColumn get quantity => integer().withDefault(const Constant(0))();
  TextColumn get category => text()();
  TextColumn get imageUrl => text().nullable()();
  BoolColumn get isAvailable => boolean().withDefault(const Constant(true))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  // Index for category searches
  @override
  List<String> get customConstraints => [
        'CHECK(price >= 0)',
        'CHECK(quantity >= 0)',
      ];
}
```

**lib/core/database/tables/orders_table.dart**:
```dart
import 'package:drift/drift.dart';
import 'users_table.dart';

class Orders extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get userId => integer().references(Users, #id)();
  RealColumn get totalAmount => real()();
  TextColumn get status => text().withDefault(const Constant('pending'))();
  TextColumn get shippingAddress => text()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get completedAt => dateTime().nullable()();
}

class OrderItems extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get orderId => integer().references(Orders, #id)();
  IntColumn get productId => integer()();
  IntColumn get quantity => integer()();
  RealColumn get priceAtPurchase => real()();
}
```

### 4. Database Class

**lib/core/database/app_database.dart**:
```dart
import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

import 'tables/users_table.dart';
import 'tables/products_table.dart';
import 'tables/orders_table.dart';
import 'daos/user_dao.dart';
import 'daos/product_dao.dart';
import 'daos/order_dao.dart';

part 'app_database.g.dart';

@DriftDatabase(
  tables: [Users, Products, Orders, OrderItems],
  daos: [UserDao, ProductDao, OrderDao],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  // For testing
  AppDatabase.forTesting(QueryExecutor e) : super(e);

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
      },
      onUpgrade: (Migrator m, int from, int to) async {
        if (from < 2) {
          // Migration from version 1 to 2
          // await m.addColumn(users, users.avatarUrl);
        }
        if (from < 3) {
          // Migration from version 2 to 3
          // await m.createTable(newTable);
        }
      },
      beforeOpen: (details) async {
        // Enable foreign keys
        await customStatement('PRAGMA foreign_keys = ON');
      },
    );
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'app_database.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
```

### 5. Data Access Objects (DAOs)

**lib/core/database/daos/user_dao.dart**:
```dart
import 'package:drift/drift.dart';
import '../app_database.dart';
import '../tables/users_table.dart';

part 'user_dao.g.dart';

@DriftAccessor(tables: [Users])
class UserDao extends DatabaseAccessor<AppDatabase> with _$UserDaoMixin {
  UserDao(super.db);

  // Get all users
  Future<List<User>> getAllUsers() => select(users).get();

  // Watch all users (reactive)
  Stream<List<User>> watchAllUsers() => select(users).watch();

  // Get user by ID
  Future<User?> getUserById(int id) {
    return (select(users)..where((u) => u.id.equals(id))).getSingleOrNull();
  }

  // Get user by email
  Future<User?> getUserByEmail(String email) {
    return (select(users)..where((u) => u.email.equals(email))).getSingleOrNull();
  }

  // Insert user
  Future<int> insertUser(UsersCompanion user) {
    return into(users).insert(user);
  }

  // Insert or update user
  Future<int> upsertUser(UsersCompanion user) {
    return into(users).insertOnConflictUpdate(user);
  }

  // Update user
  Future<bool> updateUser(User user) {
    return update(users).replace(user);
  }

  // Delete user
  Future<int> deleteUser(int id) {
    return (delete(users)..where((u) => u.id.equals(id))).go();
  }

  // Search users by name
  Future<List<User>> searchUsers(String query) {
    return (select(users)
          ..where((u) => u.name.like('%$query%'))
          ..orderBy([(u) => OrderingTerm.asc(u.name)]))
        .get();
  }

  // Get active users
  Stream<List<User>> watchActiveUsers() {
    return (select(users)
          ..where((u) => u.isActive.equals(true))
          ..orderBy([(u) => OrderingTerm.desc(u.createdAt)]))
        .watch();
  }
}
```

**lib/core/database/daos/product_dao.dart**:
```dart
import 'package:drift/drift.dart';
import '../app_database.dart';
import '../tables/products_table.dart';

part 'product_dao.g.dart';

@DriftAccessor(tables: [Products])
class ProductDao extends DatabaseAccessor<AppDatabase> with _$ProductDaoMixin {
  ProductDao(super.db);

  // Get all products
  Future<List<Product>> getAllProducts() => select(products).get();

  // Watch products with pagination
  Stream<List<Product>> watchProducts({int limit = 20, int offset = 0}) {
    return (select(products)
          ..orderBy([(p) => OrderingTerm.desc(p.createdAt)])
          ..limit(limit, offset: offset))
        .watch();
  }

  // Get products by category
  Future<List<Product>> getProductsByCategory(String category) {
    return (select(products)
          ..where((p) => p.category.equals(category))
          ..where((p) => p.isAvailable.equals(true))
          ..orderBy([(p) => OrderingTerm.asc(p.name)]))
        .get();
  }

  // Search products
  Future<List<Product>> searchProducts(String query) {
    return (select(products)
          ..where((p) =>
              p.name.like('%$query%') | p.description.like('%$query%'))
          ..where((p) => p.isAvailable.equals(true)))
        .get();
  }

  // Get products in price range
  Future<List<Product>> getProductsInPriceRange(double min, double max) {
    return (select(products)
          ..where((p) => p.price.isBetweenValues(min, max))
          ..orderBy([(p) => OrderingTerm.asc(p.price)]))
        .get();
  }

  // Insert product
  Future<int> insertProduct(ProductsCompanion product) {
    return into(products).insert(product);
  }

  // Batch insert products
  Future<void> insertProducts(List<ProductsCompanion> productList) {
    return batch((batch) {
      batch.insertAll(products, productList);
    });
  }

  // Update product
  Future<bool> updateProduct(Product product) {
    return update(products).replace(product);
  }

  // Update stock
  Future<int> updateStock(int productId, int newQuantity) {
    return (update(products)..where((p) => p.id.equals(productId)))
        .write(ProductsCompanion(quantity: Value(newQuantity)));
  }

  // Delete product
  Future<int> deleteProduct(int id) {
    return (delete(products)..where((p) => p.id.equals(id))).go();
  }

  // Get distinct categories
  Future<List<String>> getCategories() async {
    final query = selectOnly(products, distinct: true)
      ..addColumns([products.category]);
    final result = await query.get();
    return result.map((row) => row.read(products.category)!).toList();
  }
}
```

**lib/core/database/daos/order_dao.dart**:
```dart
import 'package:drift/drift.dart';
import '../app_database.dart';
import '../tables/orders_table.dart';
import '../tables/users_table.dart';

part 'order_dao.g.dart';

@DriftAccessor(tables: [Orders, OrderItems, Users])
class OrderDao extends DatabaseAccessor<AppDatabase> with _$OrderDaoMixin {
  OrderDao(super.db);

  // Get orders with user info (join)
  Future<List<OrderWithUser>> getOrdersWithUser() async {
    final query = select(orders).join([
      innerJoin(users, users.id.equalsExp(orders.userId)),
    ]);

    return query.map((row) {
      return OrderWithUser(
        order: row.readTable(orders),
        user: row.readTable(users),
      );
    }).get();
  }

  // Get orders by user ID
  Stream<List<Order>> watchUserOrders(int userId) {
    return (select(orders)
          ..where((o) => o.userId.equals(userId))
          ..orderBy([(o) => OrderingTerm.desc(o.createdAt)]))
        .watch();
  }

  // Get order with items
  Future<OrderWithItems?> getOrderWithItems(int orderId) async {
    final orderResult = await (select(orders)
          ..where((o) => o.id.equals(orderId)))
        .getSingleOrNull();

    if (orderResult == null) return null;

    final items = await (select(orderItems)
          ..where((i) => i.orderId.equals(orderId)))
        .get();

    return OrderWithItems(order: orderResult, items: items);
  }

  // Create order with items (transaction)
  Future<int> createOrder(
    OrdersCompanion order,
    List<OrderItemsCompanion> items,
  ) async {
    return transaction(() async {
      final orderId = await into(orders).insert(order);

      final itemsWithOrderId = items
          .map((item) => item.copyWith(orderId: Value(orderId)))
          .toList();

      await batch((batch) {
        batch.insertAll(orderItems, itemsWithOrderId);
      });

      return orderId;
    });
  }

  // Update order status
  Future<bool> updateOrderStatus(int orderId, String status) async {
    final companion = OrdersCompanion(
      status: Value(status),
      completedAt: status == 'completed' ? Value(DateTime.now()) : const Value.absent(),
    );

    return (update(orders)..where((o) => o.id.equals(orderId)))
            .write(companion) >
        0;
  }

  // Get orders by status
  Future<List<Order>> getOrdersByStatus(String status) {
    return (select(orders)
          ..where((o) => o.status.equals(status))
          ..orderBy([(o) => OrderingTerm.desc(o.createdAt)]))
        .get();
  }

  // Get order statistics
  Future<OrderStats> getOrderStats() async {
    final totalQuery = selectOnly(orders)
      ..addColumns([orders.id.count(), orders.totalAmount.sum()]);
    final totalResult = await totalQuery.getSingle();

    final pendingQuery = selectOnly(orders)
      ..addColumns([orders.id.count()])
      ..where(orders.status.equals('pending'));
    final pendingResult = await pendingQuery.getSingle();

    return OrderStats(
      totalOrders: totalResult.read(orders.id.count()) ?? 0,
      totalRevenue: totalResult.read(orders.totalAmount.sum()) ?? 0,
      pendingOrders: pendingResult.read(orders.id.count()) ?? 0,
    );
  }
}

// Custom classes for joined queries
class OrderWithUser {
  final Order order;
  final User user;

  OrderWithUser({required this.order, required this.user});
}

class OrderWithItems {
  final Order order;
  final List<OrderItem> items;

  OrderWithItems({required this.order, required this.items});
}

class OrderStats {
  final int totalOrders;
  final double totalRevenue;
  final int pendingOrders;

  OrderStats({
    required this.totalOrders,
    required this.totalRevenue,
    required this.pendingOrders,
  });
}
```

### 6. Generate Code

```bash
dart run build_runner build --delete-conflicting-outputs
```

### 7. Database Migrations

**Versioned migrations**:
```dart
@override
MigrationStrategy get migration {
  return MigrationStrategy(
    onCreate: (Migrator m) async {
      await m.createAll();
    },
    onUpgrade: (Migrator m, int from, int to) async {
      for (var version = from + 1; version <= to; version++) {
        await _runMigration(m, version);
      }
    },
  );
}

Future<void> _runMigration(Migrator m, int version) async {
  switch (version) {
    case 2:
      // Add column
      await m.addColumn(users, users.avatarUrl);
      break;
    case 3:
      // Create new table
      await m.createTable(products);
      break;
    case 4:
      // Add index
      await m.createIndex(Index(
        'idx_products_category',
        'CREATE INDEX idx_products_category ON products (category)',
      ));
      break;
    case 5:
      // Complex migration with raw SQL
      await customStatement('''
        ALTER TABLE users ADD COLUMN phone TEXT;
        UPDATE users SET phone = '' WHERE phone IS NULL;
      ''');
      break;
  }
}
```

### 8. Background Isolate

**lib/core/database/database_isolate.dart**:
```dart
import 'dart:io';
import 'dart:isolate';

import 'package:drift/drift.dart';
import 'package:drift/isolate.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

import 'app_database.dart';

Future<DriftIsolate> _createDriftIsolate() async {
  final dbFolder = await getApplicationDocumentsDirectory();
  final path = p.join(dbFolder.path, 'app_database.sqlite');

  final receivePort = ReceivePort();
  await Isolate.spawn(
    _startBackground,
    _IsolateStartRequest(receivePort.sendPort, path),
  );

  return await receivePort.first as DriftIsolate;
}

void _startBackground(_IsolateStartRequest request) {
  final executor = NativeDatabase(File(request.targetPath));
  final driftIsolate = DriftIsolate.inCurrent(
    () => DatabaseConnection(executor),
  );

  request.sendDriftIsolate.send(driftIsolate);
}

class _IsolateStartRequest {
  final SendPort sendDriftIsolate;
  final String targetPath;

  _IsolateStartRequest(this.sendDriftIsolate, this.targetPath);
}

// Usage
class DatabaseProvider {
  static AppDatabase? _database;
  static DriftIsolate? _isolate;

  static Future<AppDatabase> get database async {
    if (_database != null) return _database!;

    _isolate = await _createDriftIsolate();
    final connection = await _isolate!.connect();
    _database = AppDatabase.connect(connection);

    return _database!;
  }

  static Future<void> close() async {
    await _database?.close();
    await _isolate?.shutdownAll();
  }
}
```

### 9. Testing with In-Memory Database

**test/database/user_dao_test.dart**:
```dart
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:your_app/core/database/app_database.dart';

void main() {
  late AppDatabase database;
  late UserDao userDao;

  setUp(() {
    database = AppDatabase.forTesting(NativeDatabase.memory());
    userDao = database.userDao;
  });

  tearDown(() async {
    await database.close();
  });

  group('UserDao', () {
    test('insert and retrieve user', () async {
      final user = UsersCompanion.insert(
        email: 'test@example.com',
        name: 'Test User',
      );

      final id = await userDao.insertUser(user);
      expect(id, isPositive);

      final retrieved = await userDao.getUserById(id);
      expect(retrieved, isNotNull);
      expect(retrieved!.email, 'test@example.com');
      expect(retrieved.name, 'Test User');
    });

    test('search users by name', () async {
      await userDao.insertUser(UsersCompanion.insert(
        email: 'john@example.com',
        name: 'John Doe',
      ));
      await userDao.insertUser(UsersCompanion.insert(
        email: 'jane@example.com',
        name: 'Jane Doe',
      ));
      await userDao.insertUser(UsersCompanion.insert(
        email: 'bob@example.com',
        name: 'Bob Smith',
      ));

      final results = await userDao.searchUsers('Doe');
      expect(results.length, 2);
    });

    test('update user', () async {
      final id = await userDao.insertUser(UsersCompanion.insert(
        email: 'test@example.com',
        name: 'Original Name',
      ));

      final user = await userDao.getUserById(id);
      final updated = await userDao.updateUser(
        user!.copyWith(name: 'Updated Name'),
      );

      expect(updated, true);

      final retrieved = await userDao.getUserById(id);
      expect(retrieved!.name, 'Updated Name');
    });

    test('delete user', () async {
      final id = await userDao.insertUser(UsersCompanion.insert(
        email: 'test@example.com',
        name: 'Test User',
      ));

      final deleted = await userDao.deleteUser(id);
      expect(deleted, 1);

      final retrieved = await userDao.getUserById(id);
      expect(retrieved, isNull);
    });
  });
}
```

### 10. Dependency Injection

**With Riverpod**:
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

final databaseProvider = Provider<AppDatabase>((ref) {
  final database = AppDatabase();
  ref.onDispose(() => database.close());
  return database;
});

final userDaoProvider = Provider<UserDao>((ref) {
  return ref.watch(databaseProvider).userDao;
});

final productDaoProvider = Provider<ProductDao>((ref) {
  return ref.watch(databaseProvider).productDao;
});

// Usage in widget
final usersProvider = StreamProvider<List<User>>((ref) {
  return ref.watch(userDaoProvider).watchAllUsers();
});
```

### 11. Output Summary

```
Drift Database Setup Complete
=============================

Dependencies Added:
- drift: ^2.22.1
- sqlite3_flutter_libs: ^0.5.28
- path_provider: ^2.1.5
- drift_dev: ^2.22.1

Files Created:
- lib/core/database/app_database.dart
- lib/core/database/tables/users_table.dart
- lib/core/database/tables/products_table.dart
- lib/core/database/tables/orders_table.dart
- lib/core/database/daos/user_dao.dart
- lib/core/database/daos/product_dao.dart
- lib/core/database/daos/order_dao.dart

Tables Created:
- users (id, email, name, avatarUrl, isActive, createdAt, updatedAt)
- products (id, name, description, price, quantity, category, imageUrl, isAvailable, createdAt)
- orders (id, userId, totalAmount, status, shippingAddress, createdAt, completedAt)
- order_items (id, orderId, productId, quantity, priceAtPurchase)

Generate Code:
dart run build_runner build --delete-conflicting-outputs

Next Steps:
1. Run code generation
2. Initialize database in main.dart
3. Set up dependency injection
4. Write unit tests
5. Plan migrations for schema changes
```

## Agent Reference

For architecture decisions around data layers, consult the `flutter-architect` agent. For code generation patterns, consult the `flutter-codegen-assistant` agent.
