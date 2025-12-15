(() => {
    const Q = fn => {
        try {
            return fn?.();
        } catch {}
    };
    try {
        const objDoProp = function(obj, prop, def, enm, mut) {
            return Object.defineProperty(obj, prop, {
                value: def,
                writable: mut,
                enumerable: enm,
                configurable: mut,
            });
        };
        const objDefProp = (obj, prop, def) => objDoProp(obj, prop, def, false, true);
        const isNullish = (x) => x === null || x === undefined;
        const isObject = x => ['function', 'object'].includes(typeof x) && x != null;
        const objFillProp = (obj, prop, value) => {
            if (isNullish(obj[prop])) {
                return objDefProp(obj, prop, value);
            }
            return obj[prop];
        };
        const instanceOf = function instanceOf(x, y) {
            try {
                return x instanceof y;
            } catch {
                return false;
            }
        };
        const eq = (x, y) => {
            return x === y || (x !== x && y !== y);
        };
        const isFunction = (x) => typeof x === "function" || instanceOf(x, Function) || x?.constructor?.name == 'Function';
        const isString = (x) => typeof x === "string" || instanceOf(x, String) || x?.constructor?.name == 'String';
        const applyMethod = ($this, fn, args) => $this[fn].apply($this, args);

        for (const $Map of [Q(() => Headers) ?? {}, Q(() => FormData) ?? {}, Q(() => URLSearchParams) ?? {}]) {
            (() => {
                if (!$Map) return;

                (() => {
                    objFillProp($Map.prototype, "clear", function clear() {
                        for (const [key, _] of this) {
                            this.delete(key);
                        }
                    });
                })();

                (() => {
                    const _delete = $Map.prototype.delete;
                    objDefProp($Map.prototype, "delete", function $delete(key) {
                        const has = this.has(key);
                        _delete.call(this, key);
                        return has;
                    });
                    objDefProp($Map.prototype.delete, "name", "delete");
                })();

                (() => {
                    // `Map.prototype.emplace` method
                    // https://github.com/tc39/proposal-upsert
                    objFillProp($Map.prototype, "emplace", function emplace(key, handler) {
                        if (this.has(key)) {
                            const current = this.get(key);
                            if (handler.update) {
                                const value = handler.update(current, key, this);
                                this.set(key, value);
                                return value;
                            }
                            return current;
                        }
                        if (handler.insert) {
                            const inserted = handler.insert(key, this);
                            this.set(key, inserted);
                            return inserted;
                        }
                    });
                })();

                (() => {
                    // `Map.prototype.filter` method
                    // https://github.com/tc39/proposal-collection-methods
                    objFillProp(
                        $Map.prototype,
                        "filter",
                        function filter(callbackfn, thisArg) {
                            const fn = callbackfn.bind(thisArg);
                            const $map = new $Map();
                            for (const [key, value] of this) {
                                if (fn(value, key, this)) $map.append(key, value);
                            }
                            return $map;
                        },
                    );
                })();

                (() => {
                    // `Map.prototype.some` method
                    // https://github.com/tc39/proposal-collection-methods
                    objFillProp(
                        $Map.prototype,
                        "some",
                        function some(callbackfn, thisArg) {
                            const fn = callbackfn.bind(thisArg);
                            for (const [key, value] of this) {
                                if (fn(value, key, this)) return true;
                            }
                            return false;
                        },
                    );
                })();

                (() => {
                    // `Map.prototype.every` method
                    // https://github.com/tc39/proposal-collection-methods
                    objFillProp(
                        $Map.prototype,
                        "every",
                        function every(callbackfn, thisArg) {
                            const fn = callbackfn.bind(thisArg);
                            for (const [key, value] of this) {
                                if (!fn(value, key, this)) return false;
                            }
                            return true;
                        },
                    );
                })();

                (() => {
                    // `Map.prototype.includes` method
                    // https://github.com/tc39/proposal-collection-methods
                    objFillProp($Map.prototype, "includes", function includes() {
                        return applyMethod(Array.from(this.values()), "includes", arguments);
                    });
                })();

                (() => {
                    // `Map.prototype.find` method
                    // https://github.com/tc39/proposal-collection-methods
                    objFillProp(
                        $Map.prototype,
                        "find",
                        function find(callbackfn, thisArg) {
                            const boundFunction = callbackfn.bind(thisArg);
                            for (const [key, value] of this) {
                                if (boundFunction(value, key, this)) return value;
                            }
                        },
                    );
                })();

                (() => {
                    // `Map.prototype.findKey` method
                    // https://github.com/tc39/proposal-collection-methods
                    objFillProp(
                        $Map.prototype,
                        "findKey",
                        function findKey(callbackfn, thisArg) {
                            const boundFunction = callbackfn.bind(thisArg);
                            for (const [key, value] of this) {
                                if (boundFunction(value, key, this)) return key;
                            }
                        },
                    );
                })();

                (() => {
                    objFillProp($Map.prototype, "getAll", function getAll(key) {
                        if (!this.has(key)) return [];
                        if (/set-cookie/i.test(key)) return this.getSetCookie?.() ?? String(this.get(key)).split(", ");
                        return String(this.get(key)).split(", ");
                    });
                })();

                (() => {
                    new $Map().size ??
                        Object.defineProperty($Map.prototype, "size", {
                            get() {
                                return Array.from(this.entries()).length;
                            },
                            set() {},
                            enumerable: false,
                        });
                })();

                (() => {
                    objFillProp(
                        $Map.prototype,
                        "mapValues",
                        function mapValues(callbackFn, thisArg = this) {
                            const retObj = new $Map();
                            for (const [key, value] of this) {
                                const newValue = Reflect.apply(callbackFn, thisArg, [
                                    value,
                                    key,
                                    this,
                                ]);
                                retObj.append(key, newValue);
                            }
                            return retObj;
                        },
                    );
                })();

                (() => {
                    objFillProp(
                        $Map.prototype,
                        "mapKeys",
                        function mapKeys(callbackFn, thisArg = this) {
                            const retObj = new $Map();
                            for (const [key, value] of this) {
                                const newKey = Reflect.apply(callbackFn, thisArg, [
                                    value,
                                    key,
                                    this,
                                ]);
                                retObj.append(newKey, value);
                            }
                            return retObj;
                        },
                    );
                })();

                (() => {
                    objFillProp($Map.prototype, "merge", function merge(...args) {
                        const $map = new $Map(this);
                        for (const item of args) {
                            const itemMap = new $Map(item);
                            for (const [key, value] of itemMap) {
                                $map.append(key, value);
                            }
                        }
                        return $map;
                    });
                })();

                (() => {
                    objFillProp(
                        $Map.prototype,
                        "upsert",
                        function upsert(key, updateFn, insertFn) {
                            let value;
                            if (this.has(key)) {
                                value = this.get(key);
                                if (isFunction(updateFn)) {
                                    value = updateFn(value);
                                    this.set(key, value);
                                }
                            } else if (isFunction(insertFn)) {
                                value = insertFn();
                                this.set(key, value);
                            }
                            return value;
                        },
                    );
                })();

                (() => {
                    objFillProp($Map.prototype, "deleteAll", function deleteAll(keys) {
                        let all = true;
                        for (const key of keys) {
                            all = all && this.delete(key);
                        }
                        return all;
                    });
                })();

                (() => {
                    objFillProp(
                        $Map.prototype,
                        "update",
                        function update(key, callback, thunk) {
                            this.set(key, callback(this.get(key) ?? thunk(key, this), key, this));
                            return this;
                        },
                    );
                })();

                (() => {
                    objFillProp(
                        $Map.prototype,
                        "updateOrInsert",
                        function updateOrInsert() {
                            return applyMethod(this, "upsert", arguments);
                        },
                    );
                })();

                (() => {
                    objFillProp($Map.prototype, "keyOf", function keyOf(searchElement) {
                        for (const [key, value] of this) {
                            if (value === searchElement) {
                                return key;
                            }
                        }
                    });
                })();

                (() => {
                    objFillProp(
                        $Map.prototype,
                        "getOrInsert",
                        function getOrInsert(key, value) {
                            if (this.has(key)) {
                                return this.get(key);
                            }
                            this.set(key, value);
                            return value;
                        },
                    );
                })();

                (() => {
                    objFillProp(
                        $Map.prototype,
                        "getOrInsertComputed",
                        function getOrInsertComputed(key, fn) {
                            if (this.has(key)) {
                                return this.get(key);
                            }
                            const value = fn(key);
                            this.set(key, value);
                            return value;
                        },
                    );
                })();

                (() => {
                    objFillProp(
                        $Map.prototype,
                        "reduce",
                        function reduce(callbackfn, accumulator) {
                            for (const [key, value] of this) {
                                accumulator = callbackfn(accumulator, value, key, this);
                            }
                            return accumulator;
                        },
                    );
                })();
            })();
        }
        (() => {
            const $FormData = FormData;
            const _FormData = class FormData extends $FormData {
                constructor(...args) {
                    if (instanceOf(args[0], Q(() => HTMLFormElement))) {
                        return super(...args);
                    }
                    let kv = [];
                    super();
                    if (isString(args[0])) {
                        kv = new URLSearchParams(...args);
                    }
                    if (args[0]?.[Symbol.iterator]) {
                        kv = args[0];
                    } else if (isObject(args[0])) {
                        kv = Object.entries(args[0]);
                    }
                    for (const [key, value] of kv) {
                        this.append(key, value);
                    }
                }
            };
            $FormData.prototype.constructor = _FormData;
            globalThis.FormData = _FormData;
        })();
        const canWeak = (key)=>{
                try{
                    const w = new WeakMap();
                    new w.set(key,true);
                    return w.get(key);
                }catch{
                    return false;
                }
            };
        class GeekMap{
            constructor(){
                this['&map'] = new Map();
                if(typeof WeakMap !== 'undefined'){
                    this['&weakMap'] = new WeakMap();
                }else{
                    this['&weakMap'] = new Map();
                }
            }
            set(key,value){
                if(canWeak(key)){
                    return this['&weakMap'].set(key,value);
                }
                return this['&map'].set(key,value);
            }
            get(key){
                if(canWeak(key)){
                    return this['&weakMap'].get(key);
                }
                return this['&map'].get(key);
            }
        }
        (()=>{
            const appendix = new GeekMap();
            Map.prototype.append ??= function append(key,value){
                if(!this.has(key)){
                   return this.set(key,value);
                }
                if(!appendix.has(this)){
                    appendix.set(this,new Map());
                }
                const apMap = appendix.get(this);
                if(!apMap.has(key)){
                    apMap.set(key,[]);
                }
                const values = apMap.get(key);
                values.push(value);
                return apMap.push(key,values);
            };
            Map.prototype.getAll = function getAll(key){
                if(!this.has(key))return;
                const value = this.get(key);
                return [value,...appendix.get(this)?.get?.(key)??[]]
            };
        })(); 
    } catch (e) {
        console.warn(e);
    }
})();
