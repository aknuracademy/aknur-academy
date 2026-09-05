import type {
  CourseMaterial,
  MaterialType,
} from "@/types/material";

type CourseMaterialsProps = {
  materials: CourseMaterial[];
  isLocked?: boolean;
};

const materialLabels: Record<MaterialType, string> = {
  pdf: "📄 PDF",
  excel: "📊 Excel",
  word: "📝 Word",
  image: "🖼 Фото",
  text: "📖 Мәтін",
};

export default function CourseMaterials({
  materials,
  isLocked = false,
}: CourseMaterialsProps) {

  const visibleMaterials = materials.filter(
    (material) => material.is_visible
  );

  if (visibleMaterials.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        📂 Сабақ материалдары
      </h2>

      <div className="space-y-3">
        {visibleMaterials.map((material) => (
          <div
            key={material.id}
            className="rounded-xl border border-gray-200 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {materialLabels[material.material_type]}
                  </span>

                  {material.is_required && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      🔴 Міндетті материал
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  {material.title}
                </h3>

                {material.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {material.description}
                  </p>
                )}
              </div>
            </div>

            {isLocked ? (
  <div className="mt-4 rounded-lg bg-gray-100 p-4 text-center font-medium text-gray-600">
    🔒 Материалды ашу үшін курсты сатып алыңыз
  </div>
) : (
  <>
    {material.material_type === "text" &&
      material.content && (
        <div className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
          {material.content}
        </div>
      )}

    {material.material_type === "image" &&
      material.file_url && (
        <img
          src={material.file_url}
          alt={material.title}
          className="mt-4 max-h-96 w-full rounded-lg object-contain"
        />
      )}

    {material.material_type !== "text" &&
      material.file_url && (
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={material.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            👁 Қарау
          </a>

          {material.allow_download && (
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              ⬇ Жүктеу
            </a>
          )}
        </div>
      )}
  </>
)}
          </div>
        ))}
      </div>
    </section>
  );
}