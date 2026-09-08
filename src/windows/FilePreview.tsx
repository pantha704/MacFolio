import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import type { WindowKey } from '#store/useWindowStore'
import { profile } from '../data/portfolio'

const Resume = () => <div className="file-app"><div className="window-header flex items-center gap-5"><WindowControls target="resume" /><span>Résumé.pdf</span></div><div className="file-actions"><a href={profile.resume} target="_blank" rel="noopener noreferrer">Open PDF in a new tab</a><a href={profile.resume} download>Download PDF</a></div><div className="file-content"><iframe src={profile.resume} title={`${profile.name} résumé`} /></div></div>
const TextPreview = ({ windowData }: { windowData?: { name?: string; subtitle?: string; description?: string[] } }) => <div className="file-app"><div className="window-header flex items-center gap-5"><WindowControls target="txtfile" /><span>{windowData?.name ?? 'Text preview'}</span></div><div className="file-content"><h2>{windowData?.subtitle}</h2>{windowData?.description?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></div>
const ImagePreview = ({ windowData }: { windowData?: { name?: string; imageUrl?: string } }) => <div className="file-app"><div className="window-header flex items-center gap-5"><WindowControls target="imgfile" /><span>{windowData?.name ?? 'Image preview'}</span></div><div className="file-content">{windowData?.imageUrl && <img src={windowData.imageUrl} alt={windowData.name ?? 'Selected image'} />}</div></div>
const ResumeWindow = WindowWrapper(Resume, 'resume')
const TextWindow = WindowWrapper(TextPreview, 'txtfile')
const ImageWindow = WindowWrapper(ImagePreview, 'imgfile')
export default function FilePreview({ target }: { target: WindowKey }) { return target === 'resume' ? <ResumeWindow /> : target === 'txtfile' ? <TextWindow /> : <ImageWindow /> }
