import React, { memo } from "react";
import { UserResponse } from "@/types/users";
import { SelectItem } from "../ui/select";

const ListUser = memo(({ user }: { user: UserResponse }) => {
    return (
      <SelectItem key={user.id} value={user.id}>
        {user.name}
      </SelectItem>
    );
  });

export function Users({ users }: { users: UserResponse[] }) {
    return (
      <>
        {users.map(user => (
          <ListUser key={user.id} user={user} />
        ))}
      </>
    );
  }