const Person = require("../models/Person");

// Create new person
const createPerson = async (data) => {
  try {
    const person = await Person.create(data);
    return person;
  } catch (error) {
    console.error("Error creating person:", error);
    throw error;
  }
};

// Get all persons
const getAllPersons = async () => {
  try {
    return await Person.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching persons:", error);
    throw error;
  }
};

// Get one person by ID
const getPersonById = async (id) => {
  try {
    return await Person.findById(id);
  } catch (error) {
    console.error("Error fetching person:", error);
    throw error;
  }
};

// Update person
const updatePerson = async (id, data) => {
  try {
    return await Person.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    console.error("Error updating person:", error);
    throw error;
  }
};

// Delete person
const deletePerson = async (id) => {
  try {
    return await Person.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting person:", error);
    throw error;
  }
};

module.exports = {
  createPerson,
  getAllPersons,
  getPersonById,
  updatePerson,
  deletePerson,
};
