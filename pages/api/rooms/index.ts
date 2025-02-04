import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { createRoom, getRooms } from "../../../lib/mongo/rooms";
import { RoomBooking } from "../../../lib/types/types";
import { hasSession, isAdmin } from "../../../lib/utils/apiChecks";
import { isRoomBooking } from "../../../lib/utils/validators";
import { authOptions } from "../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!hasSession(res, session)) return;

  try {
    if (req.method === "GET") {
      const { rooms, error } = await getRooms();

      if (error) throw new Error(error);

      return res.status(200).json({ rooms });
    }

    if (req.method === "POST") {
      if (!isAdmin(res, session)) return;
      const room = req.body as RoomBooking;

      if (!isRoomBooking(req.body)) {
        return res.status(400).json({ error: "Invalid data format" });
      }

      const { room: createdRoom, error } = await createRoom(room);
      if (error) throw new Error(error);
      return res.status(201).json({
        message: "Period created successfully",
        data: createdRoom,
      });
    }
  } catch {
    res.status(500).json("An error occurred");
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} is not allowed.`);
};

export default handler;
