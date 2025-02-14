import { QueryFunctionContext } from "@tanstack/react-query";
import { RoomBooking } from "../types/types";

export const fetchRoomByPeriodAndId = async (context: QueryFunctionContext) => {
  const periodId = context.queryKey[1];
  const roomId = context.queryKey[2];
  return fetch(`/api/rooms/${periodId}/${roomId}`).then((res) => res.json());
};

export const fetchRoomsByPeriodId = async (context: QueryFunctionContext) => {
  const periodId = context.queryKey[1];
  return fetch(`/api/rooms/${periodId}`).then((res) => res.json());
};

export const createRoom = async (room: RoomBooking): Promise<RoomBooking> => {
  const response = await fetch(`/api/rooms/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(room),
  });

  const { message, data, error } = await response.json();
  if (!response.ok) {
    throw new Error(error || "Unknown error occurred");
  }
  return data;
};

export const deleteRoom = async (roomId: string, periodId: string) => {
  const response = await fetch(`/api/rooms/${periodId}/${roomId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete the room");
  }

  return response;
};
