import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'

export interface PreviewData {
  name: string
  fileType?: string
  href?: string
  imageUrl?: string
  subtitle?: string
  description?: string[]
}

const Preview = ({ windowData }: { windowData?: PreviewData }) => {
  if (!windowData) return null

  const renderPreview = () => {
    if (windowData.fileType === 'pdf') {
      return (
        <iframe
          src={windowData.href ?? '/files/resume.pdf'}
          title={windowData.name}
          className="w-full h-full bg-white"
        />
      )
    }

    if (windowData.fileType === 'img' && windowData.imageUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#151515] p-4">
          <img
            src={windowData.imageUrl}
            alt={windowData.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )
    }

    if (windowData.fileType === 'txt') {
      return (
        <article className="h-full overflow-y-auto bg-[#1e1e1e] p-6 sm:p-8 text-gray-200">
          {windowData.subtitle && (
            <p className="text-sm font-medium text-blue-300 mb-5">{windowData.subtitle}</p>
          )}
          <div className="space-y-4 text-sm sm:text-base leading-7 text-gray-300">
            {windowData.description?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>
      )
    }

    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-gray-400">
        Preview unavailable
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="window-header flex items-center gap-4 px-4 py-3 bg-[#292929]/95 border-b border-white/10">
        <WindowControls target="preview" />
        <span className="font-semibold text-gray-200 truncate">{windowData.name}</span>
      </div>
      <div className="flex-1 min-h-0">{renderPreview()}</div>
    </div>
  )
}

export default WindowWrapper(Preview, 'preview')
