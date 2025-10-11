import React from 'react';
import { Button } from '@mantine/core';
import { deleteUser } from '../admin/api';

interface Props {
  auth0Id: string;
}

export const DeleteUserButton: React.FC<Props> = ({ auth0Id }) => {
  const handleClick = async () => {
    if (!confirm('Really delete this user (hard delete)?')) return;
    try {
      const res = await deleteUser(auth0Id, true);
      alert(`Deleted user: ${res.deleted}`);
    } catch (err: any) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  return (
    <Button color="red" onClick={handleClick}>
      Delete User
    </Button>
  );
};
