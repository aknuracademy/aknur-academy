type LessonNavigationProps = {
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  isNextLocked: boolean;
};

export default function LessonNavigation({
  onPrevious,
  onNext,
  isFirst,
  isLast,
  isNextLocked,
}: LessonNavigationProps) {
  const nextButtonDisabled = isLast || isNextLocked;

  return (
    <div className="p-6 md:p-8">
      <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          className="rounded-lg bg-gray-200 px-5 py-3 font-bold hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Алдыңғы сабақ
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={nextButtonDisabled}
          className="rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLast
            ? "Курс аяқталды ✅"
            : isNextLocked
              ? "🔒 Алдымен сабақты аяқтаңыз"
              : "Келесі сабақ →"}
        </button>
      </div>
    </div>
  );
}