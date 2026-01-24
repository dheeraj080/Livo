const mindMapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: "Untitled Palace" },
  nodes: { type: Array, default: [] }, // Stores position, data, and type
  edges: { type: Array, default: [] }, // Stores connections
  lastModified: { type: Date, default: Date.now }
});