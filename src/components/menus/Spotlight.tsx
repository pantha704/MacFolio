import { Search, ArrowUpRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWindowStore } from '#store/useWindowStore'
import { projects } from '../../data/portfolio'
import { searchableApps } from '../../desktop/appRegistry'

const Spotlight = ({ onClose }: { onClose: () => void }) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const launched = useRef(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const open = useWindowStore((state) => state.openWindow)
  const items = [
    ...searchableApps.map((app) => ({
      title: app.name,
      detail: app.description,
      action: () => open(app.id),
    })),
    {
      title: 'All projects',
      detail: 'Explore my work',
      action: () => open('finder', { activeSide: 'work' }),
    },
    {
      title: 'About me',
      detail: 'Background and skills',
      action: () => open('finder', { activeSide: 'about' }),
    },
    ...projects.map((project) => ({
      title: project.name,
      detail: project.category,
      action: () => open('finder', { projectId: project.id }),
    })),
  ].filter((item) =>
    `${item.title} ${item.detail}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    dialogRef.current?.showModal()
    inputRef.current?.focus()
    return () => {
      if (!launched.current) previous?.focus()
    }
  }, [])
  useEffect(() => {
    document
      .getElementById(`spotlight-${selected}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [selected])
  const run = (index: number) => {
    if (items[index]) {
      launched.current = true
      items[index].action()
      onClose()
    }
  }
  return createPortal(
    <dialog
      ref={dialogRef}
      className="spotlight"
      aria-label="Search portfolio"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="spotlight-input">
        <Search size={22} />
        <input
          ref={inputRef}
          aria-label="Search apps and projects"
          role="combobox"
          aria-expanded="true"
          aria-controls="spotlight-results"
          aria-autocomplete="list"
          aria-activedescendant={
            items.length ? `spotlight-${selected}` : undefined
          }
          value={query}
          placeholder="Search projects, apps, anything…"
          onChange={(event) => {
            setQuery(event.target.value)
            setSelected(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setSelected((index) =>
                items.length ? Math.min(index + 1, items.length - 1) : 0,
              )
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setSelected((index) => Math.max(0, index - 1))
            }
            if (event.key === 'Enter') {
              event.preventDefault()
              run(selected)
            }
          }}
        />
        <button aria-label="Close search" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <ul id="spotlight-results" role="listbox" aria-label="Search results">
        {items.map((item, index) => (
          <li
            id={`spotlight-${index}`}
            key={item.title}
            role="option"
            aria-selected={selected === index}
            onMouseMove={() => setSelected(index)}
            onClick={() => run(index)}
          >
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
            <ArrowUpRight size={18} />
          </li>
        ))}
      </ul>
      {!items.length && (
        <p className="empty-state">
          No matches. Try “projects”, “contact”, or “terminal”.
        </p>
      )}
      <div className="spotlight-footer">
        ↑ ↓ to navigate <span>Enter to open · Esc to close</span>
      </div>
    </dialog>,
    document.body,
  )
}
export default Spotlight
