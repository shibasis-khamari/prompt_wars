import { SupportedLanguage } from './puzzle';

export interface TopicTierExample {
  low: string;  // Levels 1-2
  mid: string;  // Level 3
  high: string; // Levels 4-5
}

export interface TopicDefinition {
  topic: string;
  exampleBugs: TopicTierExample;
}

export const TOPIC_CATALOG: Record<SupportedLanguage, TopicDefinition[]> = {
  python: [
    {
      topic: 'Loops and conditions',
      exampleBugs: {
        low: 'Off-by-one loop boundary condition (`i < len` vs `i <= len`)',
        mid: 'Incorrect boolean operator combining conditions (`and` vs `or`)',
        high: 'Nested loop counter variable shadowing and premature break',
      },
    },
    {
      topic: 'Strings',
      exampleBugs: {
        low: 'Case-sensitivity mismatch on string comparison',
        mid: 'Incorrect slice indices when extracting substrings',
        high: 'Regex replacement pattern group backreference mistake',
      },
    },
    {
      topic: 'Lists',
      exampleBugs: {
        low: 'Modifying list elements while iterating over it',
        mid: 'Shallow copy vs deep copy mutation unintended side effect',
        high: 'Custom sorting key lambda returning tuple with inverted signs',
      },
    },
    {
      topic: 'Functions and scope',
      exampleBugs: {
        low: 'Missing return statement returning `None` implicitly',
        mid: 'Mutable default argument value shared across function calls',
        high: 'Global vs non-local variable declaration binding omission',
      },
    },
    {
      topic: 'Dictionaries',
      exampleBugs: {
        low: 'Key error on missing dictionary lookup (`dict[key]` vs `dict.get(key)`)',
        mid: 'Overwriting dictionary keys during score accumulation',
        high: 'Nested dictionary key path mutation in recursive accumulator',
      },
    },
    {
      topic: 'Recursion',
      exampleBugs: {
        low: 'Missing base case base condition check',
        mid: 'Recursive parameter accumulator state not passed forward',
        high: 'Memoization dictionary cache key omission of recursive state parameter',
      },
    },
    {
      topic: 'Classes',
      exampleBugs: {
        low: 'Forgetting `self` parameter in instance method definition',
        mid: 'Class attribute vs instance attribute mutation bug',
        high: 'Multiple inheritance `super()` method resolution order mismatch',
      },
    },
    {
      topic: 'Generators',
      exampleBugs: {
        low: 'Using `return` instead of `yield` inside generator function',
        mid: 'Exhausting a generator iterator on first check',
        high: 'Generator expression state closure evaluation lag',
      },
    },
  ],
  javascript: [
    {
      topic: 'Loops and conditions',
      exampleBugs: {
        low: 'Off-by-one loop termination condition',
        mid: 'Switch case missing `break` causing fallthrough',
        high: 'Array `.reduce()` initial accumulator parameter omission',
      },
    },
    {
      topic: 'Strings',
      exampleBugs: {
        low: 'String immutability misunderstanding (`str.replace()` result ignored)',
        mid: 'Splitting string by delimiter without handling extra spaces',
        high: 'Unicode code point surrogate pair length indexing error',
      },
    },
    {
      topic: 'Arrays',
      exampleBugs: {
        low: '`Array.prototype.sort()` sorting numbers alphabetically without comparator',
        mid: 'In-place array mutation with `.splice()` inside loop',
        high: 'Dense vs sparse array index hole handling in `.map()`',
      },
    },
    {
      topic: 'Functions and scope',
      exampleBugs: {
        low: 'Using `var` inside loop causing scope leakage',
        mid: 'Arrow function vs function declaration `arguments` object access',
        high: 'Hoisting declaration assignment order bug',
      },
    },
    {
      topic: 'Objects',
      exampleBugs: {
        low: 'Accessing property on `null` or `undefined` object',
        mid: '`Object.assign()` shallow copy mutating nested sub-objects',
        high: 'Symbol property non-enumerable key extraction',
      },
    },
    {
      topic: 'Equality and coercion',
      exampleBugs: {
        low: 'Loose equality `==` unexpectedly coercing `"0"` and `false`',
        mid: '`NaN === NaN` evaluating to `false` in numerical check',
        high: 'Implicit `valueOf` vs `toString` object coercion order',
      },
    },
    {
      topic: 'Closures and this',
      exampleBugs: {
        low: 'Losing `this` context when passing method as callback',
        mid: 'Closure capturing loop index without block scoping',
        high: 'Explicit `.bind()` binding target overriding event context',
      },
    },
    {
      topic: 'Async and promises',
      exampleBugs: {
        low: 'Forgetting `await` on asynchronous promise call',
        mid: '`Array.prototype.forEach()` with async callback not awaiting promises',
        high: '`Promise.all` failing fast vs `Promise.allSettled` requirement',
      },
    },
  ],
  java: [
    {
      topic: 'Strings',
      exampleBugs: {
        low: 'Comparing String equality with `==` instead of `.equals()`',
        mid: 'String concatenation inside tight loop instead of `StringBuilder`',
        high: 'Regex `.replaceAll()` using unescaped meta-character pattern',
      },
    },
    {
      topic: 'Null handling',
      exampleBugs: {
        low: 'Unchecked `NullPointerException` on uninitialized reference',
        mid: 'Unboxing null `Integer` wrapper to primitive `int`',
        high: '`Optional.get()` called without checking `.isPresent()`',
      },
    },
    {
      topic: 'Collections',
      exampleBugs: {
        low: 'Modifying Collection during iteration causing `ConcurrentModificationException`',
        mid: 'Missing `.hashCode()` override when customizing `.equals()` for HashSet key',
        high: '`Arrays.asList()` returning fixed-size list failing `.add()`',
      },
    },
    {
      topic: 'Classes and OOP',
      exampleBugs: {
        low: 'Missing `@Override` annotation causing method overloading instead of overriding',
        mid: 'Private field accessor returning mutable internal reference',
        high: 'Subclass constructor invoking overridden method before subclass fields initialize',
      },
    },
    {
      topic: 'Numbers',
      exampleBugs: {
        low: 'Integer division truncation (`5 / 2` yielding `2`)',
        mid: 'Numeric integer overflow on large multiplication',
        high: 'Floating point precision inaccuracy when checking strict equality',
      },
    },
  ],
  c: [
    {
      topic: 'Arrays and bounds',
      exampleBugs: {
        low: 'Array index out of bounds reading index `N` of array size `N`',
        mid: 'Buffer overflow writing past array capacity',
        high: 'Multi-dimensional array row-major memory stride calculation bug',
      },
    },
    {
      topic: 'Strings',
      exampleBugs: {
        low: 'Missing null terminator `\\0` at end of char array string',
        mid: '`strcpy` buffer overflow into destination string buffer',
        high: 'Using `strlen()` inside loop condition recalculating `O(N)` string length',
      },
    },
    {
      topic: 'Pointers and memory',
      exampleBugs: {
        low: 'Dereferencing uninitialized pointer variable',
        mid: 'Memory leak from missing `free()` call after `malloc()`',
        high: 'Dangling pointer access after freeing heap memory block',
      },
    },
    {
      topic: 'Integer types',
      exampleBugs: {
        low: 'Signed vs unsigned integer comparison warning bug',
        mid: 'Integer overflow wrapping around signed 32-bit limit',
        high: 'Bitwise shift count exceeding type bit-width',
      },
    },
  ],
  cpp: [
    {
      topic: 'References and copies',
      exampleBugs: {
        low: 'Returning reference to local stack variable',
        mid: 'Pass by value incurring unexpected object copy cost in loop',
        high: 'Rvalue reference move semantics leaving source object in invalid state',
      },
    },
    {
      topic: 'STL and iterators',
      exampleBugs: {
        low: 'Dereferencing end iterator `vec.end()`',
        mid: 'Iterator invalidation after calling `vec.push_back()` inside loop',
        high: '`std::map::operator[]` inserting default element on lookup',
      },
    },
    {
      topic: 'Classes',
      exampleBugs: {
        low: 'Missing virtual destructor in base class',
        mid: 'Rule of Three/Five violation when managing raw pointer resource',
        high: 'Member initialization list order mismatch with declaration order',
      },
    },
    {
      topic: 'Smart pointers',
      exampleBugs: {
        low: 'Creating multiple `std::shared_ptr` from raw pointer',
        mid: 'Circular reference dependency between `std::shared_ptr` causing memory leak',
        high: 'Dereferencing moved-from `std::unique_ptr`',
      },
    },
  ],
};
