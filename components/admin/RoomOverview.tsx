import { useEffect, useState } from "react";
import { periodType, RoomBooking } from "../../lib/types/types";
import Button from "../Button";
import Table, { ColumnType } from "../Table";
import DateInput from "../form/DateInput";
import TextInput from "../form/TextInput";
import TimeRangeInput from "../form/TimeRangeInput";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WithId } from "mongodb";
import toast from "react-hot-toast";
import { createRoom, deleteRoom, fetchRoomsByPeriodId } from "../../lib/api/roomApi";

interface Props {
  period?: periodType;
}

const RoomInterview = ({
  period
}: Props) => {

  const queryClient = useQueryClient();

  // TODO: Fix correct tabbing
  const [roomBookings, setRoomBookings] = useState<WithId<RoomBooking>[]>([])

  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [room, setRoom] = useState<string>("");

  const isValidBooking = () => {
    if (!room) {
      toast.error("Vennligst fyll inn rom")
      return false;
    }
    if (!date) {
      toast.error("Vennligst velg dato")
      return false;
    }
    if (!startTime || !endTime) {
      toast.error("Vennligst velg tidspunkt")
      return false;
    }
    if (Date.parse("2003-07-26T" + startTime) - Date.parse("2003-07-26T" + endTime) > 0) {
      toast.error("Starttid må være før sluttid")
      return false;
    }

    // TODO: Make sure time is within interviewPeriod

    return true;
  }

  const {
    data: roomData,
  } = useQuery({
    queryKey: ["rooms", period?._id],
    queryFn: fetchRoomsByPeriodId
  })

  const createRoomBookingMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () =>
      queryClient.invalidateQueries({
        // TODO: try to update cache instead
        queryKey: ["rooms", period?._id],
      }),
  });

  const deleteRoomBookingMutation = useMutation({
    mutationFn: (roomId: string) => deleteRoom(roomId, String(period!._id)),
    onSuccess: () =>
      queryClient.invalidateQueries({
        // TODO: try to update cache instead
        queryKey: ["rooms", period?._id],
      }),
  });

  useEffect(() => {
    if (!roomData) return
    const { rooms } = roomData
    console.log(rooms)
    setRoomBookings(rooms)
  }, [roomData])

  const handleAddBooking = () => {
    if (!isValidBooking()) return;
    addBooking()
    setRoom("")
  }

  const addBooking = () => {
    const booking: RoomBooking = {
      periodId: String(period?._id),
      room: room,
      startDate: new Date(date.split("T")[0] + "T" + startTime),
      endDate: new Date(date.split("T")[0] + "T" + endTime)
    }

    createRoomBookingMutation.mutate(booking)
  }

  const handleDeleteBooking = async (booking: WithId<RoomBooking>) => {
    if (!period) return;
    const isConfirmed = window.confirm(
      `Er det sikker på at du ønsker å fjerne bookingen av ${booking.room} fra ${booking.startDate} til ${booking.endDate}?`
    );
    if (!isConfirmed) return;

    setRoomBookings(roomBookings.filter((bookingA) => bookingA._id != booking._id))

    deleteRoomBookingMutation.mutate(String(booking._id))
  };

  const columns: ColumnType[] = [
    { label: "Rom", field: "room" },
    { label: "Dato", field: "date" },
    { label: "Fra", field: "from" },
    { label: "Til", field: "to" },
    { label: "Slett", field: "delete" },
  ]

  return <div className="flex flex-col items-center">
    <h2 className="px-5 mt-5 mb-6 text-2xl font-semibold text-center">Legg inn romvalg</h2>
    <div className="mb-5 flex flex-col justify-center">
      <div className="flex flex-row justify-center gap-10 items-baseline w-full">
        <TextInput
          defaultValue={room}
          updateInputValues={(input: string) => {
            setRoom(input)
          }}
          label="Romnavn"
          className="mx-0"
        />
        <DateInput
          updateDate={(date: string) => {
            setDate(date)
          }}
          label="Test"
        />
        <TimeRangeInput
          updateTimes={(times: { start: string, end: string }) => {
            setStartTime(times.start)
            setEndTime(times.end)
          }}
          className="mx-0"
        />
      </div>
      <Button title="Legg til" color="blue" onClick={handleAddBooking}></Button>
    </div>
    <h2 className="px-5 mt-5 mb-6 text-2xl font-semibold text-center">Alle tilgjengelige romvalg</h2>
    {roomBookings?.length ? <Table columns={columns} rows={roomBookings.map((roomBooking) => {
      return {
        id: String(roomBooking._id),
        room: roomBooking.room,
        date: new Date(roomBooking.startDate).toLocaleDateString(),
        from: new Date(roomBooking.startDate).toLocaleTimeString(),
        to: new Date(roomBooking.endDate).toLocaleTimeString()
      }
    })} onDelete={(id: string, name: string) => {
      const deletedBooking = roomBookings.find((booking, index, array) => {
        return String(booking._id) == id
      })
      handleDeleteBooking(deletedBooking!)
    }} />
      : <p><i>Legg inn et rom, så dukker det opp her.</i></p>}
  </div>
};

export default RoomInterview;
