import React, { useState, useEffect, useRef } from "react";
import { Modal } from "bootstrap";

const PersonManager = () => {
  const [persons, setPersons] = useState([]);
  const [newPerson, setNewPerson] = useState({
    name: "",
    contact: "",
    type: "debtor", // default type
  });

  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  // Fetch persons on mount
  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const data = await window.api.getAllPersons();
      setPersons(data || []);
    } catch (error) {
      console.error("Failed to fetch persons:", error);
    }
  };

  const handleCreatePerson = async () => {
    try {
      const created = await window.api.createPerson(newPerson);
      if (created) {
        fetchPersons();
        modalInstance.current.hide();
        setNewPerson({ name: "", contact: "", type: "debtor" });
      }
    } catch (error) {
      console.error("Failed to create person:", error);
    }
  };

  const openModal = () => {
    modalInstance.current = new Modal(modalRef.current);
    modalInstance.current.show();
  };

  return (
    <div className="main-content py-4 pe-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">Person Manager</h3>
        <button className="btn btn-dark shadow-sm" onClick={openModal}>
          + Create Person
        </button>
      </div>

      {/* Person List */}
      <div className="row">
        {persons.length === 0 ? (
          <p className="text-muted">No persons available</p>
        ) : (
          persons.map((person) => (
            <div key={person._id} className="col-md-4 mb-3">
              <div className="card bg-white shadow-sm p-3">
                <h5 className="card-title mb-1">{person.name}</h5>
                <p className="card-text text-muted mb-1">
                  Contact: {person.contact || "N/A"}
                </p>
                <span
                  className={`badge ${
                    person.type === "debtor" ? "bg-warning" : "bg-success"
                  }`}
                >
                  {person.type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Creating Person */}
      <div
        className="modal fade"
        ref={modalRef}
        tabIndex="-1"
        aria-labelledby="createPersonModal"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content bg-white">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Create Person</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => modalInstance.current.hide()}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPerson.name}
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contact</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPerson.contact}
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, contact: e.target.value })
                  }
                  placeholder="Enter contact"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={newPerson.type}
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, type: e.target.value })
                  }
                >
                  <option value="seller">Seller</option>
                  <option value="buyer">Buyer</option>
                  <option value="both">Seller & Buyer</option>
                  <option value="self">Me</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => modalInstance.current.hide()}
              >
                Cancel
              </button>
              <button className="btn btn-dark" onClick={handleCreatePerson}>
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonManager;
