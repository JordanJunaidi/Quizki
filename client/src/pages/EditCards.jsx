import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom"; // Hook for navigation between pages
import FlashcardList from "../components/FlashcardList.jsx"; // Component to display flashcards
import CreateFlashcard from "../components/CreateFlashcard.jsx"; // Component to create a flashcard
import "./EditCards.css"; // CSS for styling the Create page
import Chatbot from "../components/Chatbot.jsx";

export default function Create() {
  const [SAMPLE_FLASHCARDS, setFlashcards] = useState([]);

  const [groups, setGroups] = useState([]);
  const { user } = useAuth0();

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!user?.email) return;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/records/users/${user.email}`
        );
        const result = await response.json();
        const terms = result[0]?.terms || [];
        const groups = [];

        const formatted = terms.flatMap((languageGroup) => {
          const [type, pairs] = Object.entries(languageGroup)[0];
          return Object.entries(pairs).map(([q, a], i) => ({
            id: `${type}-${i}`,
            question: q,
            answer: a,
            group: type.charAt(0).toUpperCase() + type.slice(1),
          }));
        });

        terms.forEach((languageGroup) => {
          const [group, translations] = Object.entries(languageGroup)[0];
          groups.push(group);
        });

        setFlashcards(formatted);
        setGroups(groups);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
    };

    fetchFlashcards();
  }, [user?.email]);

  // State to track the current page ('choose', 'create-group', 'create', or 'list')
  const [currentPage, setCurrentPage] = useState("choose");

  // State to track the selected group
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Hook to navigate between routes
  const navigate = useNavigate();

  // Function to add a new flashcard to the selected group
  const addFlashcard = async (question, answer) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/records/vocab/${user.email}/${question}/${answer}/${selectedGroup}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question, answer }),
        }
      );

      if (!response.ok) throw new Error("Failed to add flashcard");

      const newFlashcard = {
        id: Date.now(),
        question,
        answer,
        group: selectedGroup,
      };

      setFlashcards((prev) => [...prev, newFlashcard]);
      return true;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  // Function to create a new group
  const createGroup = async (groupName) => {
    if (!groupName.trim()) {
      alert("Group name cannot be empty");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/records/vocab/${user.email}/${groupName}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to create group");
      setGroups([...groups, groupName]);
      return groupName; // Return the created group name
    } catch (error) {
      console.error("Error creating group:", error);
      throw error; // Re-throw for error handling in components
    }
  };

  // Function to clear all groups and flashcards
  const clearAll = async () => {
    if (!user?.email) return;

    const confirmClear = window.confirm(
      "Are you sure you want to clear all groups and flashcards?"
    );
    if (!confirmClear) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/records/${user.email}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok)
        throw new Error("Failed to clear all groups and flashcards");

      setFlashcards([]);
      setGroups([]);
      alert("All groups and flashcards have been cleared.");
    } catch (error) {
      console.error("Error clearing all groups and flashcards:", error);
      alert("Failed to clear all groups and flashcards.");
    }
  };

  return (
    <div className="app">
      {/* Choose page: Decide to create a group or add to an existing group */}
      {currentPage === "choose" && (
        <div className="choose-container view-flashcards-button">
          <h2>What would you like to do?</h2>
          <button onClick={() => setCurrentPage("create-group")}>
            Create a New Group
          </button>
          {/* Conditionally render the text and group list only if there are groups */}
          {groups.length > 0 && (
            <>
              <h3>Or choose an existing group:</h3>
              <div className="group-list view-flashcards-button">
                {groups.map((group) => (
                  <button
                    key={group}
                    onClick={() => {
                      setSelectedGroup(group);
                      setCurrentPage("create");
                    }}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </>
          )}
          {/* Clear All Button */}
          <div className="clear-all-button">
            <button className="clear-all-button" onClick={clearAll}>
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Create group page */}
      {currentPage === "create-group" && (
        <div className="create-group-container">
          <h2>Create a New Group</h2>
          <input
            type="text"
            placeholder="Enter group name"
            onKeyDown={async (e) => {
              if (e.key === "Enter" && e.target.value.trim() !== "") {
                const groupName = e.target.value.trim();
                try {
                  await createGroup(groupName); // Create the group
                  alert("New group created!"); // Show success message
                  setCurrentPage("choose"); // Navigate back to the "choose" page
                } catch (error) {
                  alert("Failed to create group. Please try again."); // Handle errors
                }
              }
            }}
          />
          <button onClick={() => setCurrentPage("choose")}>Back</button>
        </div>
      )}

      {/* Create flashcard page */}
      {currentPage === "create" && (
        <CreateFlashcard addFlashcard={addFlashcard} />
      )}

      {/* Flashcard list page */}
      {currentPage === "list" && (
        <FlashcardList flashcards={SAMPLE_FLASHCARDS} />
      )}

      {/* Button to navigate to the Flashcards page */}
      <div className="view-flashcards-button">
        <button onClick={() => navigate("/flashcards")}>View Flashcards</button>
      </div>
      <Chatbot />
    </div>
  );
}
