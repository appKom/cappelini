import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { hasSession, isAdmin } from "../../../../lib/utils/apiChecks";
import { getPeriodById } from "../../../../lib/mongo/periods";
import { deleteRoom, getRoom } from "../../../../lib/mongo/rooms";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!hasSession(res, session)) return;

  const id = req.query.id;
  const periodId = req.query["period-id"];

  if (typeof id !== "string" || typeof periodId !== "string") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const { period } = await getPeriodById(periodId);

  if (!period) {
    return res.status(404).json({ error: "Period not found" });
  }

  if (!isAdmin(res, session))
    return res.status(403).json({ error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const { room, exists, error } = await getRoom(id);

      if (error) {
        return res.status(500).json({ error });
      }

      if (!exists) {
        return res.status(404).json({ message: "Room not found" });
      }

      return res.status(200).json({ exists, room });
    } else if (req.method === "DELETE") {
      const { error } = await deleteRoom(id);

      if (error) throw new Error(error);

      return res.status(204).end();
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json("Unexpected error occurred");
  }

  res.setHeader("Allow", ["GET", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default handler;
