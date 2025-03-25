window.indexedDBHelper = {
    openDatabase: function (dbName, storeName) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName, 1);

            request.onupgradeneeded = function (event) {
                let db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
                }
            };

            request.onsuccess = function (event) {
                resolve(event.target.result);
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    // 建立新的 IndexedDB 資料庫 (如果已存在則不會重新建立)
    createDatabase: function (dbName) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName, 1);

            request.onupgradeneeded = function (event) {
                let db = event.target.result;
                console.log(`資料庫 '${dbName}' 已建立`);
            };

            request.onsuccess = function (event) {
                let db = event.target.result;
                db.close();
                resolve(`資料庫 '${dbName}' 建立成功！`);
            };

            request.onerror = function (event) {
                reject(`建立資料庫失敗: ${event.target.error}`);
            };
        });
    },

    // 在指定的 IndexedDB 資料庫內新增 Object Store
    createStore: function (dbName, storeName, keyPath = "id") {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName, 2); // 增加版本號，確保 onupgradeneeded 觸發

            request.onupgradeneeded = function (event) {
                let db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: keyPath });
                    console.log(`Store '${storeName}' 已新增至 '${dbName}'`);
                }
            };

            request.onsuccess = function (event) {
                let db = event.target.result;
                db.close();
                resolve(`物件存儲 '${storeName}' 建立成功！`);
            };

            request.onerror = function (event) {
                reject(`建立物件存儲失敗: ${event.target.error}`);
            };
        });
    },

    // 刪除指定的DB Name
    deleteDatabase: function (dbName) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.deleteDatabase(dbName);

            request.onsuccess = function () {
                resolve(true);
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };

            request.onblocked = function () {
                reject("Database deletion is blocked!");
            };
        });
    },

    listDatabases: async function () {
        if (!indexedDB.databases) {
            return Promise.reject("瀏覽器不支援 indexedDB.databases()");
        }

        let dbs = await indexedDB.databases();
        return dbs.map(db => db.name).filter(name => name !== null);
    },

    listStores: function (dbName) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName);

            request.onsuccess = function (event) {
                let db = event.target.result;
                let storeNames = Array.from(db.objectStoreNames);
                db.close();
                resolve(storeNames);
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    addItem: function (dbName, storeName, item) {
        return new Promise((resolve, reject) => {
            window.indexedDBHelper.openDatabase(dbName, storeName).then(db => {
                let transaction = db.transaction(storeName, "readwrite");
                let store = transaction.objectStore(storeName);
                let request = store.add(item);

                request.onsuccess = function () {
                    resolve(request.result);
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    },

    getItems: function (dbName, storeName) {
        return new Promise((resolve, reject) => {
            window.indexedDBHelper.openDatabase(dbName, storeName).then(db => {
                let transaction = db.transaction(storeName, "readonly");
                let store = transaction.objectStore(storeName);
                let request = store.getAll();

                request.onsuccess = function () {
                    resolve(request.result);
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    },

    getItemById: function (dbName, storeName, id) {
        return new Promise((resolve, reject) => {
            window.indexedDBHelper.openDatabase(dbName, storeName).then(db => {
                let transaction = db.transaction(storeName, "readonly");
                let store = transaction.objectStore(storeName);
                let request = store.get(id);

                request.onsuccess = function () {
                    resolve(request.result);
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    },

    updateItem: function (dbName, storeName, item) {
        return new Promise((resolve, reject) => {
            window.indexedDBHelper.openDatabase(dbName, storeName).then(db => {
                let transaction = db.transaction(storeName, "readwrite");
                let store = transaction.objectStore(storeName);
                let request = store.put(item); // 必須包含原始 id

                request.onsuccess = function () {
                    resolve(true);
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    },

    deleteItem: function (dbName, storeName, id) {
        return new Promise((resolve, reject) => {
            window.indexedDBHelper.openDatabase(dbName, storeName).then(db => {
                let transaction = db.transaction(storeName, "readwrite");
                let store = transaction.objectStore(storeName);
                let request = store.delete(id);

                request.onsuccess = function () {
                    resolve(true);
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    },

    clearStore: function (dbName, storeName) {
        return new Promise((resolve, reject) => {
            window.indexedDBHelper.openDatabase(dbName, storeName).then(db => {
                let transaction = db.transaction(storeName, "readwrite");
                let store = transaction.objectStore(storeName);
                let request = store.clear();

                request.onsuccess = function () {
                    resolve(true);
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    }

    
};
