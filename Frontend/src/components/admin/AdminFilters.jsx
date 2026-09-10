
import React, {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
    FiFilter,
    FiX,
    FiChevronDown,
    FiCalendar,
} from 'react-icons/fi';

const AdminFilters = ({
    filters = [],
    onApply,
    onClear,
    loading,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState({});
    const [portalReady, setPortalReady] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState({});

    const wrapperRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const updateDropdownPosition = () => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const viewportPadding = 12;
        const preferredWidth = 320;
        const width = Math.min(
            preferredWidth,
            window.innerWidth - viewportPadding * 2
        );

        let left = rect.right - width;

        if (left < viewportPadding) {
            left = viewportPadding;
        }

        if (left + width > window.innerWidth - viewportPadding) {
            left = window.innerWidth - width - viewportPadding;
        }

        setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 8,
            left,
            width,
            maxHeight: Math.max(
                300,
                Math.min(520, window.innerHeight - rect.bottom - 24)
            ),
            zIndex: 100000,
        });
    };

    useEffect(() => {
        setPortalReady(true);
    }, []);

    useLayoutEffect(() => {
        if (!isOpen) return;

        updateDropdownPosition();

        const handlePositionChange = () => {
            updateDropdownPosition();
        };

        window.addEventListener('resize', handlePositionChange);
        window.addEventListener('scroll', handlePositionChange, true);

        return () => {
            window.removeEventListener('resize', handlePositionChange);
            window.removeEventListener('scroll', handlePositionChange, true);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedButton =
                wrapperRef.current &&
                wrapperRef.current.contains(event.target);

            const clickedDropdown =
                dropdownRef.current &&
                dropdownRef.current.contains(event.target);

            if (!clickedButton && !clickedDropdown) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleChange = (key, value) => {
        setValues((previousValues) => ({
            ...previousValues,
            [key]: value,
        }));
    };

    const handleApply = () => {
        if (onApply) {
            onApply(values);
        }

        setIsOpen(false);
    };

    const handleClear = () => {
        setValues({});

        if (onClear) {
            onClear();
        }
    };

    const handleToggle = () => {
        if (!isOpen) {
            updateDropdownPosition();
        }

        setIsOpen((previousState) => !previousState);
    };

    const hasValues = Object.keys(values).some(
        (key) =>
            values[key] !== '' &&
            values[key] !== undefined &&
            values[key] !== null
    );

    const dropdownContent = isOpen && portalReady
        ? createPortal(
              <div
                  ref={dropdownRef}
                  style={dropdownStyle}
                  className="flex overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl shadow-blue-950/20"
              >
                  <div className="flex min-h-0 w-full flex-col">
                      <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-sky-100 bg-sky-50 px-4 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm">
                                  <FiFilter className="h-4 w-4" />
                              </span>

                              <h3 className="min-w-0 truncate font-bold text-slate-800">
                                  Filters
                              </h3>
                          </div>

                          <button
                              type="button"
                              onClick={() => setIsOpen(false)}
                              aria-label="Close filters"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-blue-600"
                          >
                              <FiX className="h-4 w-4" />
                          </button>
                      </div>

                      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
                          {filters.map((filter) => (
                              <div
                                  key={filter.key}
                                  className="min-w-0 overflow-hidden"
                              >
                                  <label className="mb-1.5 block truncate text-xs font-bold uppercase text-slate-500">
                                      {filter.label}
                                  </label>

                                  {filter.type === 'select' ? (
                                      <select
                                          value={values[filter.key] || ''}
                                          onChange={(event) =>
                                              handleChange(
                                                  filter.key,
                                                  event.target.value
                                              )
                                          }
                                          disabled={loading}
                                          className="w-full min-w-0 rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                          <option value="">All</option>

                                          {(filter.options || []).map(
                                              (option) => (
                                                  <option
                                                      key={option.value}
                                                      value={option.value}
                                                  >
                                                      {option.label}
                                                  </option>
                                              )
                                          )}
                                      </select>
                                  ) : filter.type === 'date' ? (
                                      <div className="relative min-w-0">
                                          <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />

                                          <input
                                              type="date"
                                              value={values[filter.key] || ''}
                                              onChange={(event) =>
                                                  handleChange(
                                                      filter.key,
                                                      event.target.value
                                                  )
                                              }
                                              disabled={loading}
                                              className="w-full min-w-0 rounded-xl border border-sky-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
                                          />
                                      </div>
                                  ) : filter.type === 'range' ? (
                                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                                          <input
                                              type="number"
                                              placeholder="Min"
                                              value={
                                                  values[
                                                      `${filter.key}_min`
                                                  ] || ''
                                              }
                                              onChange={(event) =>
                                                  handleChange(
                                                      `${filter.key}_min`,
                                                      event.target.value
                                                  )
                                              }
                                              disabled={loading}
                                              className="w-full min-w-0 rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-sky-200"
                                          />

                                          <span className="shrink-0 text-slate-400">
                                              –
                                          </span>

                                          <input
                                              type="number"
                                              placeholder="Max"
                                              value={
                                                  values[
                                                      `${filter.key}_max`
                                                  ] || ''
                                              }
                                              onChange={(event) =>
                                                  handleChange(
                                                      `${filter.key}_max`,
                                                      event.target.value
                                                  )
                                              }
                                              disabled={loading}
                                              className="w-full min-w-0 rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-sky-200"
                                          />
                                      </div>
                                  ) : (
                                      <input
                                          type="text"
                                          value={values[filter.key] || ''}
                                          onChange={(event) =>
                                              handleChange(
                                                  filter.key,
                                                  event.target.value
                                              )
                                          }
                                          placeholder={
                                              filter.placeholder || 'Search...'
                                          }
                                          disabled={loading}
                                          className="w-full min-w-0 rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                  )}
                              </div>
                          ))}
                      </div>

                      <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-sky-100 bg-slate-50 p-4">
                          <button
                              type="button"
                              onClick={handleApply}
                              disabled={loading}
                              className="min-w-0 truncate rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:from-sky-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                              Apply Filters
                          </button>

                          <button
                              type="button"
                              onClick={handleClear}
                              disabled={loading}
                              className="shrink-0 rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-sky-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                              Clear
                          </button>
                      </div>
                  </div>
              </div>,
              document.body
          )
        : null;

    return (
        <>
            <div ref={wrapperRef} className="relative shrink-0">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={handleToggle}
                    aria-expanded={isOpen}
                    className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border px-3 transition-all ${
                        hasValues
                            ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-sky-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-sky-50 hover:text-blue-700'
                    }`}
                >
                    <FiFilter className="h-4 w-4 shrink-0" />

                    <span className="text-sm font-semibold">Filters</span>

                    {hasValues && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                    )}

                    <FiChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>
            </div>

            {dropdownContent}
        </>
    );
};

export default AdminFilters;

