import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getRoomsByPeriod } from "../../../../lib/mongo/rooms";
import { hasSession } from "../../../../lib/utils/apiChecks";
import { authOptions } from "../../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!hasSession(res, session)) return;

  const periodId = req.query["period-id"];

  try {
    if (req.method === "GET") {
      if (typeof periodId != "string") {
        throw new Error("Not a valid period id string");
      }
      const { rooms, error } = await getRoomsByPeriod(periodId);

      if (error) throw new Error(error);

      return res.status(200).json({ rooms });
    }
  } catch {
    res.status(500).json("An error occurred");
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} is not allowed.`);
};

export default handler;
