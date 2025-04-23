import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Switch, TouchableOpacity, Modal, Pressable } from "react-native";
import axios from "axios";

const API_URL = 'https://todo-mobile-app-qaj8.onrender.com/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err.message);
    }
  };

  const addTask = async () => {
    if (title.trim() === "") return;
    try {
      const res = await axios.post(API_URL, { title, completed: false });
      setTasks([...tasks, res.data]);
      setTitle("");
    } catch (err) {
      console.error("Error adding task:", err.message);
    }
  };

  const toggleComplete = async (id, currentStatus, title) => {
    try {
      await axios.put(`${API_URL}/${id}`, { title, completed: !currentStatus });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err.message);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
  };

  const submitEdit = async () => {
    try {
      await axios.put(`${API_URL}/${editingTask.id}`, { title: editTitle, completed: editingTask.completed });
      setEditingTask(null);
      setEditTitle("");
      fetchTasks();
    } catch (err) {
      console.error("Error editing task:", err.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && styles.darkText]}>Tasks List</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} thumbColor={darkMode ? "#f5a" : "#f0f0f0"} />
      </View>

      <View style={styles.filterContainer}>
        {['all', 'completed', 'Pending'].map((f) => (
          <Pressable
            key={f}
            style={[styles.filterButton, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f)}>
            <Text style={styles.filterText}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity style={styles.taskBubble} onPress={() => toggleComplete(item.id, item.completed, item.title)}>
              <Text style={[styles.taskText, item.completed && styles.taskCompleted]}>{item.title}</Text>
            </TouchableOpacity>
            <View style={styles.taskActions}>
              <Text onPress={() => startEditing(item)} style={styles.icon}>Edit</Text>
              <Text onPress={() => deleteTask(item.id)} style={styles.icon}>Delete</Text>
            </View>
          </View>
        )}
      />

      <TextInput
        style={[styles.input, darkMode && styles.darkInput]}
        value={title}
        onChangeText={setTitle}
        placeholder="Add a new task"
        placeholderTextColor={darkMode ? "#aaa" : "#999"}
      />
      <Pressable style={styles.addButton} onPress={addTask}>
        <Text style={styles.addButtonText}>＋ Add Task</Text>
      </Pressable>

      <Modal visible={editingTask !== null} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, darkMode && styles.darkContainer]}>
            <TextInput
              style={[styles.input, darkMode && styles.darkInput]}
              value={editTitle}
              onChangeText={setEditTitle}
            />
            <Pressable style={styles.saveButton} onPress={submitEdit}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setEditingTask(null)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#eaf1fb", // Light blue background
  },
  darkContainer: {
    backgroundColor: "#2c2f3d", // Darker tone for dark mode
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#8a9cfc", // Soft lavender color
  },
  darkText: {
    color: "#f0f0f0", // Light text for dark mode
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: "#c5b9e5", // Lavender button color
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activeFilter: {
    backgroundColor: "#b29bf1", // Slightly darker lavender for active state
  },
  filterText: {
    fontWeight: "bold",
    color: "#fff",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f7fc", // Light blue background for tasks
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  taskBubble: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4a4a9d", // Soft, muted purple
  },
  taskCompleted: {
    textDecorationLine: "line-through",
    color: "#b0b0d1", // Lighter color for completed tasks
  },
  taskActions: {
    flexDirection: "row",
    marginLeft: 10,
  },
  icon: {
    fontSize: 18,
    marginHorizontal: 8,
    color: "#8f8fbe", // Soft silver icon color
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d3e2", // Silver border color for input
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#ffffff", // White background for input
  },
  darkInput: {
    backgroundColor: "#444",
    color: "#fff",
    borderColor: "#666",
  },
  addButton: {
    backgroundColor: "#8a9cfc", // Soft lavender for the add button
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    margin: 30,
    padding: 24,
    backgroundColor: "#ffffff", // White modal background
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  saveButton: {
    backgroundColor: "#f3b5d4", // Soft pink for save button
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#ffb3c1", // Soft pastel pink for cancel button
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
