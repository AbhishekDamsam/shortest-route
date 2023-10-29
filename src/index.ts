import { createApp } from './app';


const PORT = process.env.PORT || 3000;

// To maximize the use of the server computation, cluster module of node can be used. ("node:cluster") npm module
// The master core will spawn and create those many instances of createApp() using cluster.fork().
// The other cores will init the server and run the createApp()
// We can add logic to spawn new instance of createApp() if existing core is terminated
createApp()
  .then((app) => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => console.error(err));

