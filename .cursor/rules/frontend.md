# Frontend Development

## Tech Stack

- Alpine.js 3.x via CDN
- Tailwind CSS via CDN
- Express.js server
- Vanilla JavaScript (no build step)

## Alpine.js Patterns

### Component Structure

Use `x-data` to define component state and methods:

```html
<div x-data="appName()">
  <!-- component template -->
</div>

<script>
  function appName() {
    return {
      // state
      activeTab: "dashboard",
      loading: false,

      // methods
      async init() {
        await this.loadData();
      },

      async loadData() {
        // fetch data
      },
    };
  }
</script>
```

### Common Directives

- `x-data` - Declare component scope
- `x-init` - Run on component initialization
- `x-show` - Toggle visibility (keeps in DOM)
- `x-if` - Conditional rendering (removes from DOM)
- `x-for` - Loop over arrays
- `x-model` - Two-way data binding
- `x-on:click` (or `@click`) - Event listeners
- `x-text` - Set text content
- `x-bind:class` (or `:class`) - Dynamic classes

### Reactivity

Alpine.js automatically tracks dependencies. Modify state directly:

```javascript
// Good
this.count++;
this.items.push(newItem);

// Works but verbose
this.$nextTick(() => {
  // DOM updated
});
```

## API Integration

### Fetch Pattern

Always use try/catch with proper error handling:

```javascript
async loadData() {
  try {
    const response = await fetch('/api/endpoint');
    if (response.ok) {
      this.data = await response.json();
    } else {
      this.error = 'Failed to load data';
    }
  } catch (error) {
    console.error('Error:', error);
    this.error = error.message;
  }
}
```

### POST Requests

```javascript
async submitData() {
  this.loading = true;
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.formData)
    });

    if (response.ok) {
      this.success = true;
    }
  } finally {
    this.loading = false;
  }
}
```

## Tailwind CSS

### Common Patterns

- Containers: `container mx-auto px-4`
- Cards: `bg-white rounded-lg shadow p-6`
- Buttons: `px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg`
- Spacing: Use consistent spacing scale (4, 6, 8)
- Responsive: Use `md:` and `lg:` prefixes

### State Classes

Use `:class` binding for dynamic states:

```html
<button :class="loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'">
  <span x-show="!loading">Submit</span>
  <span x-show="loading">Loading...</span>
</button>
```

## Server API Patterns

### Endpoint Structure

```typescript
app.get("/api/resource", async (req, res) => {
  return Sentry.startSpan({ name: "api.getResource" }, async () => {
    try {
      const data = await fetchData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error message" });
    }
  });
});
```

### Response Format

- Success: `res.json({ data })` or `res.json(data)` for arrays
- Error: `res.status(code).json({ message: "Error description" })`
- Always wrap in Sentry spans

## File Organization

```
public/
  index.html        # Main frontend app
src/
  server.ts         # Express server + API routes
```

## Best Practices

✅ Keep Alpine components simple and focused
✅ Use semantic HTML
✅ Provide loading states for async operations
✅ Show error messages to users
✅ Use Tailwind utility classes, avoid custom CSS
✅ Make UI responsive (mobile-first)

❌ Don't use jQuery or other libraries (Alpine handles DOM)
❌ Don't create custom CSS files
❌ Don't use inline styles
❌ Don't forget error handling in API calls
