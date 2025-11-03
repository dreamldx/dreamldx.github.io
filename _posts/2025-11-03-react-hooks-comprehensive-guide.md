---
layout: post
title: "React Hooks: A Comprehensive Guide"
date: 2025-11-03
categories: [react, javascript, hooks, web-development]
tags: [react, hooks, useState, useEffect, useContext, useReducer, custom-hooks, tutorial, advanced]
---

# React Hooks: A Comprehensive Guide

## Table of Contents
1. [Theory: Understanding React Hooks](#theory)
2. [Under the Hood: How Hooks Work](#under-the-hood)
3. [Catalog: Built-in Hooks](#catalog)
4. [Common Use Cases & Examples](#common-use-cases)
5. [Pitfalls & Best Practices](#pitfalls)

---

## Theory: Understanding React Hooks {#theory}

### What Are React Hooks?

React Hooks are **functions that let you "hook into" React state and lifecycle features from function components**. Introduced in React 16.8 (February 2019), Hooks revolutionized how we write React components by enabling stateful logic without classes.

### Why Hooks?

Before Hooks, React had several problems:

1. **Wrapper Hell**: Higher-Order Components (HOCs) and Render Props created deeply nested component trees
2. **Complex Components**: Class components with lifecycle methods became hard to understand
3. **Confusing Classes**: `this` binding and class syntax confused developers and machines (harder to minify)
4. **Logic Reuse**: Sharing stateful logic between components was difficult

### The Rules of Hooks

Hooks follow two fundamental rules:

```javascript
// ✅ Rule 1: Only call Hooks at the top level
function MyComponent() {
  const [count, setCount] = useState(0); // ✅ Top level

  if (count > 5) {
    const [name, setName] = useState(''); // ❌ Conditional hook
  }

  return <div>{count}</div>;
}

// ✅ Rule 2: Only call Hooks from React functions
function MyComponent() {
  const [value, setValue] = useState(0); // ✅ React component
  return <div>{value}</div>;
}

function regularFunction() {
  const [value, setValue] = useState(0); // ❌ Not a React function
}
```

**Why these rules?** React relies on the **order** of Hook calls to maintain state correctly across renders. Conditional or nested hooks break this order.

### Hook Philosophy

Hooks embody several key principles:

- **Composition over Inheritance**: Build complex logic by composing simple hooks
- **Separation of Concerns**: Group related logic together (not by lifecycle method)
- **Functional Programming**: Embrace pure functions and immutability
- **Progressive Enhancement**: Adopt incrementally, no need to rewrite existing code

---

## Under the Hood: How Hooks Work {#under-the-hood}

### The Fiber Architecture

React uses a **Fiber** architecture where each component instance has a corresponding Fiber node. Hooks are stored as a **linked list** on the Fiber node.

```javascript
// Simplified Fiber structure
type Fiber = {
  memoizedState: Hook | null,  // First hook in the linked list
  // ... other properties
}

type Hook = {
  memoizedState: any,           // Hook's current state
  baseState: any,               // Base state for useReducer/useState
  queue: UpdateQueue | null,    // Queue of pending updates
  next: Hook | null,            // Next hook in the list
}
```

### Hook Call Sequence

```javascript
function Counter() {
  const [count, setCount] = useState(0);     // Hook 0
  const [name, setName] = useState('Alice'); // Hook 1
  useEffect(() => {/* ... */});              // Hook 2

  return <div>{count} - {name}</div>;
}
```

**First Render (Mount):**
1. React creates a Fiber node
2. Each Hook call creates a new Hook object
3. Hooks linked: Hook0 → Hook1 → Hook2
4. Fiber.memoizedState points to Hook0

**Subsequent Renders (Update):**
1. React retrieves the Fiber node
2. Starts from Fiber.memoizedState (Hook0)
3. Each Hook call retrieves the **next** hook in the list
4. Order must match or hooks break!

### useState Implementation (Simplified)

```javascript
let currentFiber = null;
let currentHook = null;

function useState(initialState) {
  // Get or create hook
  let hook;

  if (currentFiber.isMounting) {
    // First render: create new hook
    hook = {
      memoizedState: initialState,
      queue: { pending: null },
      next: null
    };

    // Add to linked list
    if (currentFiber.memoizedState === null) {
      currentFiber.memoizedState = hook;
    } else {
      currentHook.next = hook;
    }
    currentHook = hook;
  } else {
    // Update: retrieve existing hook
    hook = currentHook.next;
    currentHook = hook;
  }

  // Process queued updates
  const state = hook.memoizedState;
  const queue = hook.queue;

  if (queue.pending !== null) {
    // Apply all updates
    let update = queue.pending.next;
    let newState = state;

    do {
      newState = typeof update.action === 'function'
        ? update.action(newState)
        : update.action;
      update = update.next;
    } while (update !== queue.pending.next);

    hook.memoizedState = newState;
    queue.pending = null;
  }

  // Create setState function
  const setState = (action) => {
    const update = { action, next: null };

    // Add to circular queue
    if (queue.pending === null) {
      update.next = update;
    } else {
      update.next = queue.pending.next;
      queue.pending.next = update;
    }
    queue.pending = update;

    // Schedule re-render
    scheduleWork(currentFiber);
  };

  return [hook.memoizedState, setState];
}
```

### Why Hook Order Matters

```javascript
function BrokenComponent({ condition }) {
  const [count, setCount] = useState(0);

  // ❌ Conditional hook breaks the linked list
  if (condition) {
    const [name, setName] = useState('Alice');
  }

  const [age, setAge] = useState(25);

  // First render (condition=true):  Hook0(count) → Hook1(name) → Hook2(age)
  // Second render (condition=false): Hook0(count) → Hook1(age) ⚠️ MISMATCH!
  // React tries to use Hook1 as 'name' but gets 'age' instead!
}
```

---

## Catalog: Built-in Hooks {#catalog}

### State Hooks

#### `useState`
Adds state to function components.

```javascript
const [state, setState] = useState(initialState);
```

#### `useReducer`
Alternative to `useState` for complex state logic.

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

### Effect Hooks

#### `useEffect`
Performs side effects after render.

```javascript
useEffect(() => {
  // Effect code
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

#### `useLayoutEffect`
Synchronous version of `useEffect`, runs before paint.

```javascript
useLayoutEffect(() => {
  // Synchronous effect
}, [dependencies]);
```

#### `useInsertionEffect` (React 18+)
Runs before all DOM mutations, for CSS-in-JS libraries.

```javascript
useInsertionEffect(() => {
  // Insert styles
}, [dependencies]);
```

### Context Hook

#### `useContext`
Subscribes to React context.

```javascript
const value = useContext(MyContext);
```

### Ref Hooks

#### `useRef`
Creates a mutable reference that persists across renders.

```javascript
const ref = useRef(initialValue);
```

#### `useImperativeHandle`
Customizes the instance value exposed by `ref`.

```javascript
useImperativeHandle(ref, () => ({
  focus: () => { /* ... */ }
}), [dependencies]);
```

### Performance Hooks

#### `useMemo`
Memoizes expensive computations.

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

#### `useCallback`
Memoizes callback functions.

```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Transition Hooks (React 18+)

#### `useTransition`
Marks state updates as non-urgent.

```javascript
const [isPending, startTransition] = useTransition();
```

#### `useDeferredValue`
Defers updating non-urgent parts of the UI.

```javascript
const deferredValue = useDeferredValue(value);
```

### ID Hook (React 18+)

#### `useId`
Generates unique IDs for accessibility attributes.

```javascript
const id = useId();
```

### Sync Hook (React 18+)

#### `useSyncExternalStore`
Subscribes to external stores.

```javascript
const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

### Debug Hook

#### `useDebugValue`
Displays a label in React DevTools.

```javascript
useDebugValue(value, format);
```

---

## Common Use Cases & Examples {#common-use-cases}

### 1. Form State Management

```javascript
function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email required';
    if (!formData.password) newErrors.password = 'Password required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    console.log('Submitting:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <span>{errors.email}</span>}
      </div>
      <div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <span>{errors.password}</span>}
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
```

### 2. Data Fetching with useEffect

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user');

        const data = await response.json();

        // Prevent state update if component unmounted
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [userId]); // Re-fetch when userId changes

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 3. Complex State with useReducer

```javascript
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload,
          completed: false
        }]
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
    default:
      return state;
  }
};

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all'
  });
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      dispatch({ type: 'ADD_TODO', payload: inputValue });
      setInputValue('');
    }
  };

  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed;
    if (state.filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo}>Add</button>

      <div>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}>
          All
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'active' })}>
          Active
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}>
          Completed
        </button>
      </div>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. Context for Global State

```javascript
// Create context
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const value = useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming context
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Usage
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#000' : '#fff'
      }}
    >
      Toggle Theme (Current: {theme})
    </button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  );
}
```

### 5. DOM References with useRef

```javascript
function AutoFocusInput() {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}
```

### 6. Performance Optimization with useMemo

```javascript
function ExpensiveList({ items, filter }) {
  // Only recompute when items or filter changes
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  // Expensive calculation
  const statistics = useMemo(() => {
    console.log('Calculating statistics...');
    return {
      total: filteredItems.length,
      average: filteredItems.reduce((acc, item) => acc + item.value, 0) / filteredItems.length
    };
  }, [filteredItems]);

  return (
    <div>
      <p>Total: {statistics.total}</p>
      <p>Average: {statistics.average}</p>
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}: {item.value}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 7. Optimized Callbacks with useCallback

```javascript
function Parent() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);

  // Without useCallback, this creates a new function on every render
  // causing Child to re-render unnecessarily
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Empty deps: function never changes

  const incrementBy = useCallback((amount) => {
    setCount(c => c + amount);
  }, []); // Function uses updater form, no dependencies needed

  return (
    <div>
      <p>Count: {count}</p>
      <p>Other: {otherState}</p>
      <button onClick={() => setOtherState(o => o + 1)}>
        Update Other State
      </button>

      {/* Child only re-renders when increment function changes (never) */}
      <Child onIncrement={increment} onIncrementBy={incrementBy} />
    </div>
  );
}

const Child = React.memo(({ onIncrement, onIncrementBy }) => {
  console.log('Child rendered');
  return (
    <div>
      <button onClick={onIncrement}>+1</button>
      <button onClick={() => onIncrementBy(5)}>+5</button>
    </div>
  );
});
```

### 8. Custom Hooks

```javascript
// Custom hook for local storage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>

      <input
        type="number"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
      />
    </div>
  );
}
```

### 9. Debounced Search with Custom Hook

```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true);

      fetch(`/api/search?q=${debouncedSearchTerm}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {loading && <div>Searching...</div>}
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 10. Window Size Hook

```javascript
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

function ResponsiveComponent() {
  const { width } = useWindowSize();

  return (
    <div>
      <p>Window width: {width}px</p>
      {width < 768 ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  );
}
```

---

## Pitfalls & Best Practices {#pitfalls}

### 1. Stale Closures

**Problem:** Closures capture variables from their creation time, leading to stale values.

```javascript
// ❌ BAD: Stale closure
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count); // Always logs 0!
      setCount(count + 1); // Always sets to 1!
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty deps array = closure captures initial count (0)

  return <div>{count}</div>;
}

// ✅ GOOD: Use functional update
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1); // Uses current value
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>{count}</div>;
}
```

### 2. Missing Dependencies

**Problem:** Omitting dependencies from useEffect can cause bugs.

```javascript
// ❌ BAD: Missing dependency
function UserGreeting({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // Missing userId!
  // When userId changes, user data doesn't update

  return <div>Hello, {user?.name}</div>;
}

// ✅ GOOD: Include all dependencies
function UserGreeting({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchUser(userId).then(data => {
      if (!cancelled) setUser(data);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]); // ✅ userId included

  return <div>Hello, {user?.name}</div>;
}
```

**Use ESLint:** Enable `eslint-plugin-react-hooks` to catch missing dependencies:

```json
{
  "extends": ["plugin:react-hooks/recommended"]
}
```

### 3. Unnecessary Re-renders

**Problem:** Creating new object/array/function references on every render.

```javascript
// ❌ BAD: New array reference on every render
function FilteredList({ items }) {
  const [filter, setFilter] = useState('');

  // This creates a new array on EVERY render
  const options = ['option1', 'option2', 'option3'];

  return <Select options={options} />;
}

// ✅ GOOD: Move outside component or use useMemo
const OPTIONS = ['option1', 'option2', 'option3']; // Outside component

function FilteredList({ items }) {
  const [filter, setFilter] = useState('');
  return <Select options={OPTIONS} />;
}
```

```javascript
// ❌ BAD: New function on every render
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <Child
      onClick={() => setCount(count + 1)} // New function every render
    />
  );
}

// ✅ GOOD: Use useCallback
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return <Child onClick={handleClick} />;
}
```

### 4. useEffect Infinite Loops

**Problem:** Effect updates state that triggers the effect again.

```javascript
// ❌ BAD: Infinite loop
function Component({ data }) {
  const [processed, setProcessed] = useState([]);

  useEffect(() => {
    setProcessed(data.map(transform)); // Updates state
  }, [processed]); // Depends on state it updates! ♾️

  return <div>{processed}</div>;
}

// ✅ GOOD: Depend on source data
function Component({ data }) {
  const [processed, setProcessed] = useState([]);

  useEffect(() => {
    setProcessed(data.map(transform));
  }, [data]); // Depends on input, not output

  return <div>{processed}</div>;
}

// ✅ EVEN BETTER: Use useMemo
function Component({ data }) {
  const processed = useMemo(
    () => data.map(transform),
    [data]
  );

  return <div>{processed}</div>;
}
```

### 5. Not Cleaning Up Effects

**Problem:** Subscriptions or timers continue after unmount.

```javascript
// ❌ BAD: Memory leak
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    // No cleanup! Interval continues after unmount
  }, []);

  return <div>{count}</div>;
}

// ✅ GOOD: Clean up
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(id); // Cleanup!
  }, []);

  return <div>{count}</div>;
}
```

### 6. Overusing useState

**Problem:** Multiple related state variables that should be grouped.

```javascript
// ❌ BAD: Scattered state
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  // ... dozens more fields

  return (/* ... */);
}

// ✅ GOOD: Group related state
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: 0,
    address: '',
    phone: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (/* ... */);
}

// ✅ EVEN BETTER: Use useReducer for complex state
function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function Form() {
  const [formData, dispatch] = useReducer(formReducer, initialState);
  return (/* ... */);
}
```

### 7. Using useCallback/useMemo Everywhere

**Problem:** Premature optimization makes code harder to read.

```javascript
// ❌ BAD: Over-optimization
function Component({ a, b }) {
  // Memoizing simple addition is wasteful
  const sum = useMemo(() => a + b, [a, b]);

  // Memoizing trivial functions is unnecessary
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <div onClick={handleClick}>{sum}</div>;
}

// ✅ GOOD: Optimize only when needed
function Component({ a, b }) {
  const sum = a + b; // Simple calculation, no memo needed

  const handleClick = () => {
    console.log('clicked');
  };

  return <div onClick={handleClick}>{sum}</div>;
}
```

**When to optimize:**
- Heavy computations in `useMemo`
- Callbacks passed to memoized child components in `useCallback`
- Preventing re-renders of expensive children
- After profiling shows performance issues

### 8. Conditional Hooks

**Problem:** Breaking the Rules of Hooks.

```javascript
// ❌ BAD: Conditional hook
function Component({ isLoggedIn }) {
  if (isLoggedIn) {
    const [user, setUser] = useState(null); // ❌ Conditional!
  }
  return <div>Hello</div>;
}

// ❌ BAD: Hook in loop
function Component({ items }) {
  return items.map(item => {
    const [selected, setSelected] = useState(false); // ❌ In loop!
    return <div>{item}</div>;
  });
}

// ✅ GOOD: Always call hooks at top level
function Component({ isLoggedIn }) {
  const [user, setUser] = useState(null);

  if (!isLoggedIn) {
    return <div>Please log in</div>;
  }

  return <div>Hello, {user?.name}</div>;
}
```

### 9. Forgetting Dependency Arrays

**Problem:** Effect runs on every render.

```javascript
// ❌ BAD: Runs every render
function Component({ userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(userId).then(setData);
  }); // No dependency array! Fetches on every render

  return <div>{data}</div>;
}

// ✅ GOOD: Specify dependencies
function Component({ userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(userId).then(setData);
  }, [userId]); // Only fetch when userId changes

  return <div>{data}</div>;
}
```

### 10. Race Conditions in Effects

**Problem:** Async operations complete out of order.

```javascript
// ❌ BAD: Race condition
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
    // If userId changes from 1 → 2 → 1:
    // Request order: fetch(1), fetch(2), fetch(1)
    // Response order might be: fetch(2), fetch(1), fetch(1)
    // User sees: User 2 → User 1 → User 1 (wrong user!)
  }, [userId]);

  return <div>{user?.name}</div>;
}

// ✅ GOOD: Ignore stale responses
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchUser(userId).then(data => {
      if (!cancelled) {
        setUser(data); // Only update if still relevant
      }
    });

    return () => {
      cancelled = true; // Mark as cancelled on cleanup
    };
  }, [userId]);

  return <div>{user?.name}</div>;
}

// ✅ ALTERNATIVE: Use AbortController (modern approach)
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/users/${userId}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(setUser)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => {
      controller.abort(); // Cancel in-flight request
    };
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

### Summary of Best Practices

✅ **DO:**
- Follow the Rules of Hooks religiously
- Use ESLint plugin `react-hooks` for validation
- Clean up effects (return cleanup functions)
- Use functional updates when new state depends on old state
- Extract custom hooks to reuse stateful logic
- Profile before optimizing with `useMemo`/`useCallback`
- Handle race conditions in async effects
- Keep effects focused (one effect per concern)

❌ **DON'T:**
- Call hooks conditionally or in loops
- Omit dependencies from effect arrays
- Mutate state directly (always use setState)
- Over-optimize with premature memoization
- Create functions/objects inside render without memoization when passing to memoized children
- Forget to clean up subscriptions/timers
- Use complex logic in components (extract to custom hooks)

---

## Conclusion

React Hooks fundamentally changed how we write React applications. They enable:

- **Simpler components**: No more class complexity
- **Better code organization**: Group by concern, not lifecycle
- **Reusable logic**: Custom hooks are composable and shareable
- **Better performance**: Easier optimization with proper memoization

Master the basics (`useState`, `useEffect`, `useContext`), understand the rules, watch out for common pitfalls, and you'll write cleaner, more maintainable React code.

### Further Reading

- [React Hooks Documentation](https://react.dev/reference/react)
- [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)
- [Built-in React Hooks Reference](https://react.dev/reference/react/hooks)
- [React Hooks FAQ](https://react.dev/learn/hooks-faq)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

*Happy Hooking! 🎣*
