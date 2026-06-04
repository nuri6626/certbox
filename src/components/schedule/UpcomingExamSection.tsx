type UpcomingExamEvent = {
  id: string;
  examName: string;
  label: string;
  date: string;
};

type UpcomingExamSectionProps = {
  events: UpcomingExamEvent[];
  getDdayText: (date: string) => string;
};

export default function UpcomingExamSection({
  events,
  getDdayText,
}: UpcomingExamSectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-bold">📅 곧 다가오는 일정</h2>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-3xl border border-blue-100 bg-blue-50 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{event.examName}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {event.label} · {event.date}
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-blue-700">
                {getDdayText(event.date)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}