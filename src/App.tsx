import { useState } from "react";
import { useLiveQuery } from "@tanstack/react-db";
import { todosCollection } from "./todo.collection.ts";
import { eq } from "@tanstack/db";

export const App = () => {
  const [activeTodo, setActiveTodo] = useState<number>(1);

  const todoDetail = useLiveQuery(
    (q) =>
      q
        .from({ todo: todosCollection })
        .where(({ todo }) => eq(todo.id, activeTodo))
        .findOne(),
    [activeTodo],
  );

  return (
    <div>
      <button onClick={() => setActiveTodo(activeTodo - 1)}>BACK</button>
      <button onClick={() => setActiveTodo(activeTodo + 1)}>NEXT</button>
      <h1>{todoDetail.data?.name ?? null}</h1>
    </div>
  );
};
