'use client';

import React, { useState } from 'react';
import { updateGroupLimits } from './actions';

const LimitsPage = () => {
  const [groupId, setGroupId] = useState('');
  const [maxProjects, setMaxProjects] = useState(0);
  const [maxApps, setMaxApps] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGroupLimits(groupId, maxProjects, maxApps);
      alert('Group limits updated successfully');
    } catch (error) {
      alert('Failed to update group limits');
    }
  };

  return (
    <div>
      <h1>Project and Apps Usage Limits</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Group ID:</label>
          <input type="text" value={groupId} onChange={(e) => setGroupId(e.target.value)} required />
        </div>
        <div>
          <label>Max Projects:</label>
          <input type="number" value={maxProjects} onChange={(e) => setMaxProjects(Number(e.target.value))} required />
        </div>
        <div>
          <label>Max Apps:</label>
          <input type="number" value={maxApps} onChange={(e) => setMaxApps(Number(e.target.value))} required />
        </div>
        <button type="submit">Update Limits</button>
      </form>
    </div>
  );
};

export default LimitsPage;