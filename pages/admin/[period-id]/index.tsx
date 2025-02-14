import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import router from "next/router";
import { periodType } from "../../../lib/types/types";
import NotFound from "../../404";
import ApplicantsOverview from "../../../components/applicantoverview/ApplicantsOverview";
import RoomOverview from "../../../components/admin/RoomOverview";
import { Tabs } from "../../../components/Tabs";
import { CalendarIcon, InboxIcon, BuildingOffice2Icon } from "@heroicons/react/24/solid";
import Button from "../../../components/Button";
import { useQuery } from "@tanstack/react-query";
import { fetchPeriodById } from "../../../lib/api/periodApi";
import LoadingPage from "../../../components/LoadingPage";
import ErrorPage from "../../../components/ErrorPage";
import toast from "react-hot-toast";

const Admin = () => {
  const { data: session } = useSession();
  const periodId = router.query["period-id"] as string;
  const [period, setPeriod] = useState<periodType | null>(null);
  const [committees, setCommittees] = useState<string[] | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [tabClicked, setTabClicked] = useState<number>(0);

  const { data, isError, isLoading } = useQuery({
    queryKey: ["periods", periodId],
    queryFn: fetchPeriodById,
  });

  useEffect(() => {
    setPeriod(data?.period);
    setCommittees(
      data?.period.committees.concat(data?.period.optionalCommittees)
    );
  }, [data, session?.user?.owId]);

  const sendOutInterviewTimes = async ({ periodId }: { periodId: string }) => {
    const confirm = window.confirm(
      "Er du sikker på at du vil sende ut intervju tider?"
    );

    if (!confirm) return;

    try {
      const response = await fetch(
        `/api/periods/send-interview-times/${periodId}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to send out interview times");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      toast.success("Intervjutider er sendt ut! (Sjekk konsoll loggen)");
      return data;
    } catch (error) {
      toast.error("Failed to send out interview times");
    }
  };

  console.log(committees);

  if (session?.user?.role !== "admin") return <NotFound />;
  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorPage />;

  return (
    <div className="px-5 py-2">
      <Tabs
        activeTab={activeTab}
        setActiveTab={(index) => {
          setActiveTab(index);
          setTabClicked(index);
        }}
        content={[
          {
            title: "Søkere",
            icon: <CalendarIcon className="w-5 h-5" />,
            content: (
              <ApplicantsOverview
                period={period}
                committees={committees}
                includePreferences={true}
              />
            ),
          },
          {
            title: "Romoppsett",
            icon: <BuildingOffice2Icon className="w-5 h-5" />,
            content: (
              <RoomOverview
                period={period}
              />
            )
          },
          //Super admin :)
          ...(session?.user?.email &&
            ["fhansteen@gmail.com", "jotto0214@gmail.com"].includes(
              session.user.email
            )
            ? [
              {
                title: "Send ut",
                icon: <InboxIcon className="w-5 h-5" />,
                content: (
                  <div className="flex flex-col items-center">
                    <Button
                      title={"Send ut intervjutider"}
                      color={"blue"}
                      onClick={() => sendOutInterviewTimes({ periodId })}
                    />
                  </div>
                ),
              },
            ]
            : []),
        ]}
      />
    </div>
  );
};

export default Admin;
