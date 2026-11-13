import { useState } from "react";

function StoryForm({ story, members, isEdit, onSave, onCancel }) {
  const [title, setTitle] = useState(story.title);
  const [description, setDescription] = useState(story.description);
  const [priority, setPriority] = useState(story.priority);
  const [status, setStatus] = useState(story.status);
  const [assignedId, setAssignedId] = useState(story.assigned_user_id || "");

  async function handleSubmit(event) {
    event.preventDefault();

    const data = {
      title: title,
      description: description,
      priority: priority,
      assigned_user_id: assignedId === "" ? null : assignedId
    };
    // should only be included when editing the story
    if (isEdit) {
      data.status = status;
    }
    const saved = await onSave(data);


    // if created successfully, give empty form/clear it
    if (saved && !isEdit) {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setAssignedId("");
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          placeholder="As a [type of user], I want [goal], so that [benefit]."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div>
        <label>Priority:</label>
        <select value={priority} onChange={(event) => setPriority(event.target.value)}>

          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      {isEdit && (
        <div>
          <label>Status:</label>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      )}

      <div>
        <label>Assigned Member:</label>
        <select value={assignedId} onChange={(event) => setAssignedId(event.target.value)}>
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member._id} value={member._id}>
              {member.f_name} {member.l_name} ({member.username})
            </option>
          ))}
        </select>
      </div>

      <button type="submit">{isEdit ? "Save" : "Add Story"}</button>
      {isEdit && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
export default StoryForm;
