import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { RoomBooking } from "../types/types";
import clientPromise from "./mongodb";

let client: MongoClient;
let db: Db;
let rooms: Collection<RoomBooking>;

async function init() {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db();
    rooms = db.collection("rooms");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to establish connection to database");
  }
}

(async () => {
  await init();
})();

export const createRoom = async (roomData: RoomBooking) => {
  try {
    if (!rooms) await init();

    const existingRoom = await rooms.findOne({
      room: roomData.room,
      periodId: roomData.periodId,
      $or: [
        /* Tillater ikke overlappende tidspunkt på samme rom. */
        {
          $and: [
            {
              startDate: { $gte: roomData.startDate },
            },
            { startDate: { $lte: roomData.endDate } },
          ],
        },
        {
          $and: [
            {
              endDate: { $gte: roomData.startDate },
            },
            { endDate: { $lte: roomData.endDate } },
          ],
        },
      ],
    });

    if (existingRoom) {
      return { error: "409 Room booking already exists for this period" };
    }

    const result = await rooms.insertOne(roomData);
    if (result.insertedId) {
      const insertedRoom = await rooms.findOne({
        _id: result.insertedId,
      });
      if (insertedRoom) {
        return { room: insertedRoom };
      } else {
        return { error: "Failed to retrieve the created room" };
      }
    } else {
      return { error: "Failed to create room" };
    }
  } catch (error) {
    console.error(error);
    return { error: "Failed to create room" };
  }
};

export const getRooms = async () => {
  try {
    if (!rooms) await init();
    const result = await rooms.find({}).toArray();
    return { rooms: result };
  } catch (error) {
    return { error: "Failed to fetch rooms" };
  }
};

export const getRoom = async (roomId: string) => {
  try {
    if (!rooms) await init();

    const result = await rooms.findOne({
      _id: new ObjectId(roomId),
    });

    return { room: result, exists: !!result };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch room", exists: false };
  }
};

export const getRoomsByPeriod = async (periodId: string) => {
  try {
    if (!rooms) await init();

    const result = await rooms
      .find({ periodId: periodId }) // No ObjectId conversion needed
      .toArray();

    return { rooms: result, exists: result.length > 0 };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch rooms" };
  }
};

export const deleteRoom = async (id: string) => {
  try {
    if (!rooms) await init();

    const result = await rooms.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 1) {
      return { message: "Room deleted successfully" };
    } else {
      return { error: "Room not found or already deleted" };
    }
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete room" };
  }
};
