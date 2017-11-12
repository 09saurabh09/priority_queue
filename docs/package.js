(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    "README.md": {
      "path": "README.md",
      "content": "Description\n-----------\n\nA priority queue is a handy data structure with many uses. From graph search\nalgorithms to simple job queues, having this in your toolbelt will help to give\nyou a solid foundation.\n\nFeatures\n--------\n\n* Simple to use and understand.\n* Creates a single PriorityQueue constructor.\n* Instantiate via `PriorityQueue()` or `new PriorityQueue()`\n* Offers both highest first and lowest first ordering.\n* Test suite included.\n\nThe default is highest priority first, but when doing something like A* you want lowest priority first... it handles it: `queue = PriorityQueue({low: true});` Boom!\n\nExample Usage\n-------------\n\n    # Highest priority first\n    queue = PriorityQueue()\n\n    queue.push(\"b\", 5)\n    queue.push(\"a\", 10)\n\n    queue.pop() # => \"a\"\n    queue.pop() # => \"b\"\n\n    # Lowest priority first\n    queue = PriorityQueue\n      low: true\n\n    queue.push(\"x\", 5)\n    queue.push(\"y\", 10)\n\n    queue.pop() # => \"x\"\n    queue.pop() # => \"y\"\n\nLicense\n-------\n\nMIT\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "content": "Priority Queue\n==============\n\nPriorityQueue manages a queue of elements with priorities. The defaul behavior\nis to return elements with the highest priority first.\n\nIf `low` is set to `true` returns lowest first instead.\n\n    PriorityQueue = (options={}) ->\n      items = []\n      sorted = false\n\n      if options.low\n        sortStyle = prioritySortLow\n      else\n        sortStyle = prioritySortHigh\n\n      sort = ->\n        items.sort sortStyle\n        sorted = true\n\nAccessor functions need to ensure the items are sorted. This decorator wraps\nthat up nicely.\n\n      ensureSorted = (fn) ->\n        (args...) ->\n          sort() unless sorted\n          fn(args...)\n\nPublic Methods\n--------------\n\nRemoves and returns the next element in the queue. If the queue is empty returns\n`undefined`.\n\n      pop: ensureSorted ->\n        items.pop()?.object\n\nReturns but does not remove the next element in the queue. If the queue is empty\nreturns `undefined`.\n\n      top: ensureSorted ->\n        items[items.length - 1]?.object\n\nCheck if the given object is included in the priority queue. Returns true if\nit was found, false if not.\n\n      includes: (object) ->\n        items.reduce (found, item) ->\n          found or (object is item.object)\n        , false\n\nReturn the current number of elements in the queue.\n\n      size: ->\n        items.length\n\nCheck if the queue is empty. Returns true if there are no items in the queue,\nfalse otherwise.\n\n      empty: ->\n        items.length is 0\n\nPush an object onto the queue with the given priority.\n\n      push: (object, priority) ->\n        items.push\n          object: object\n          priority: priority\n\n        sorted = false\n\nHelpers\n-------\n\n    prioritySortLow = (a, b) ->\n      b.priority - a.priority\n\n    prioritySortHigh = (a, b) ->\n      a.priority - b.priority\n\nExport\n------\n\n    if module?\n      module.exports = PriorityQueue\n    else\n      window.PriorityQueue = PriorityQueue\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"2.0.1\"\nentryPoint: \"main\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/priority_queue.coffee": {
      "path": "test/priority_queue.coffee",
      "content": "PriorityQueue = require \"../main\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"PriorityQueue\", ->\n  test \"#push\", ->\n    queue = PriorityQueue()\n    queue.push 2, 5\n\n    ok queue.size() is 1, \"queue.size()\"\n    ok not queue.empty(), \"!queue.empty()\"\n\n  test \"#includes\", ->\n    queue = PriorityQueue()\n    queue.push 5, 0\n\n    equals queue.includes(5), true\n    equals queue.includes(0), false\n\n  test \"#empty\", ->\n    queue = PriorityQueue()\n    ok queue.size() is 0, \"queue.size() === 0\"\n    ok queue.empty(), \"queue.empty()\"\n\n  test \"#pop empty queue\", ->\n    equals PriorityQueue().pop(), undefined\n\n  test \"#pop\", ->\n    queue = PriorityQueue()\n\n    good = {}\n    decent = {}\n    bad = {}\n\n    queue.push good, 10\n    queue.push decent, 5\n    queue.push bad, 1\n\n    equals queue.pop(), good, \"Start with best\"\n    equals queue.pop(), decent, \"then next best\"\n    equals queue.pop(), bad, \"then next\"\n\n  test \"#pop with low => true\", ->\n    queue = PriorityQueue(low: true)\n\n    good = {}\n    decent = {}\n    bad = {}\n\n    queue.push good, 1\n    queue.push decent, 5\n    queue.push bad, 10\n\n    equals queue.pop(), good, \"Start with best\"\n    equals queue.pop(), decent, \"then next best\"\n    equals queue.pop(), bad, \"then next\"\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "main": {
      "path": "main",
      "content": "(function() {\n  var PriorityQueue, prioritySortHigh, prioritySortLow,\n    __slice = [].slice;\n\n  PriorityQueue = function(options) {\n    var ensureSorted, items, sort, sortStyle, sorted;\n    if (options == null) {\n      options = {};\n    }\n    items = [];\n    sorted = false;\n    if (options.low) {\n      sortStyle = prioritySortLow;\n    } else {\n      sortStyle = prioritySortHigh;\n    }\n    sort = function() {\n      items.sort(sortStyle);\n      return sorted = true;\n    };\n    ensureSorted = function(fn) {\n      return function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        if (!sorted) {\n          sort();\n        }\n        return fn.apply(null, args);\n      };\n    };\n    return {\n      pop: ensureSorted(function() {\n        var _ref;\n        return (_ref = items.pop()) != null ? _ref.object : void 0;\n      }),\n      top: ensureSorted(function() {\n        var _ref;\n        return (_ref = items[items.length - 1]) != null ? _ref.object : void 0;\n      }),\n      includes: function(object) {\n        return items.reduce(function(found, item) {\n          return found || (object === item.object);\n        }, false);\n      },\n      size: function() {\n        return items.length;\n      },\n      empty: function() {\n        return items.length === 0;\n      },\n      push: function(object, priority) {\n        items.push({\n          object: object,\n          priority: priority\n        });\n        return sorted = false;\n      }\n    };\n  };\n\n  prioritySortLow = function(a, b) {\n    return b.priority - a.priority;\n  };\n\n  prioritySortHigh = function(a, b) {\n    return a.priority - b.priority;\n  };\n\n  if (typeof module !== \"undefined\" && module !== null) {\n    module.exports = PriorityQueue;\n  } else {\n    window.PriorityQueue = PriorityQueue;\n  }\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"2.0.1\",\"entryPoint\":\"main\"};",
      "type": "blob"
    },
    "test/priority_queue": {
      "path": "test/priority_queue",
      "content": "(function() {\n  var PriorityQueue, equals, ok, test;\n\n  PriorityQueue = require(\"../main\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"PriorityQueue\", function() {\n    test(\"#push\", function() {\n      var queue;\n      queue = PriorityQueue();\n      queue.push(2, 5);\n      ok(queue.size() === 1, \"queue.size()\");\n      return ok(!queue.empty(), \"!queue.empty()\");\n    });\n    test(\"#includes\", function() {\n      var queue;\n      queue = PriorityQueue();\n      queue.push(5, 0);\n      equals(queue.includes(5), true);\n      return equals(queue.includes(0), false);\n    });\n    test(\"#empty\", function() {\n      var queue;\n      queue = PriorityQueue();\n      ok(queue.size() === 0, \"queue.size() === 0\");\n      return ok(queue.empty(), \"queue.empty()\");\n    });\n    test(\"#pop empty queue\", function() {\n      return equals(PriorityQueue().pop(), void 0);\n    });\n    test(\"#pop\", function() {\n      var bad, decent, good, queue;\n      queue = PriorityQueue();\n      good = {};\n      decent = {};\n      bad = {};\n      queue.push(good, 10);\n      queue.push(decent, 5);\n      queue.push(bad, 1);\n      equals(queue.pop(), good, \"Start with best\");\n      equals(queue.pop(), decent, \"then next best\");\n      return equals(queue.pop(), bad, \"then next\");\n    });\n    return test(\"#pop with low => true\", function() {\n      var bad, decent, good, queue;\n      queue = PriorityQueue({\n        low: true\n      });\n      good = {};\n      decent = {};\n      bad = {};\n      queue.push(good, 1);\n      queue.push(decent, 5);\n      queue.push(bad, 10);\n      equals(queue.pop(), good, \"Start with best\");\n      equals(queue.pop(), decent, \"then next best\");\n      return equals(queue.pop(), bad, \"then next\");\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/zine2/"
  },
  "config": {
    "version": "2.0.1",
    "entryPoint": "main"
  },
  "version": "2.0.1",
  "entryPoint": "main",
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "STRd6/priority_queue",
    "homepage": "",
    "description": "A JavaScript PriorityQueue",
    "html_url": "https://github.com/STRd6/priority_queue",
    "url": "https://api.github.com/repos/STRd6/priority_queue",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});