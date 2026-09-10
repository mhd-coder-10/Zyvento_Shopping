
import React, {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
    FiSearch,
    FiX,
    FiClock,
    FiTrendingUp,
} from 'react-icons/fi';

const AdminSearchBar = ({
    onSearch,
    placeholder,
    recentSearches = [],
    suggestions = [],
}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [portalReady, setPortalReady] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState({});

    const wrapperRef = useRef(null);
    const inputContainerRef = useRef(null);
    const dropdownRef = useRef(null);

    const updateDropdownPosition = () => {
        if (!inputContainerRef.current) return;

        const rect = inputContainerRef.current.getBoundingClientRect();
        const viewportPadding = 12;
        const availableWidth = window.innerWidth - viewportPadding * 2;
        const dropdownWidth = Math.min(rect.width, availableWidth);

        let left = rect.left;
        if (left + dropdownWidth > window.innerWidth - viewportPadding) {
            left = window.innerWidth - dropdownWidth - viewportPadding;
        }

        left = Math.max(viewportPadding, left);

        setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 8,
            left,
            width: dropdownWidth,
            maxHeight: Math.max(
                180,
                Math.min(360, window.innerHeight - rect.bottom - 24)
            ),
            zIndex: 99999,
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
            const clickedInsideInput =
                wrapperRef.current &&
                wrapperRef.current.contains(event.target);

            const clickedInsideDropdown =
                dropdownRef.current &&
                dropdownRef.current.contains(event.target);

            if (!clickedInsideInput && !clickedInsideDropdown) {
                setIsOpen(false);
                setIsFocused(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (query.trim()) {
            if (onSearch) {
                onSearch(query.trim());
            }

            setIsOpen(false);
            setIsFocused(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setIsOpen(false);

        if (onSearch) {
            onSearch('');
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        setQuery(suggestion);

        if (onSearch) {
            onSearch(suggestion);
        }

        setIsOpen(false);
        setIsFocused(false);
    };

    const handleFocus = () => {
        setIsFocused(true);

        if (
            query.trim() ||
            recentSearches.length > 0 ||
            suggestions.length > 0
        ) {
            updateDropdownPosition();
            setIsOpen(true);
        }
    };

    const handleInputChange = (event) => {
        const value = event.target.value;
        setQuery(value);

        if (
            value.trim() ||
            recentSearches.length > 0 ||
            suggestions.length > 0
        ) {
            updateDropdownPosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const trendingSearches = [
        'New orders',
        'Pending sellers',
        'Refund requests',
        'High value orders',
    ];

    const dropdownContent = isOpen && portalReady
        ? createPortal(
              <div
                  ref={dropdownRef}
                  style={dropdownStyle}
                  className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl shadow-blue-950/20"
              >
                  <div className="max-h-[inherit] overflow-y-auto overscroll-contain p-2">
                      {query.trim() && suggestions.length > 0 && (
                          <div>
                              <p className="px-3 py-2 text-xs font-bold uppercase text-slate-400">
                                  Suggestions
                              </p>

                              <div className="space-y-1">
                                  {suggestions.map((suggestion, index) => (
                                      <button
                                          key={index}
                                          type="button"
                                          onClick={() =>
                                              handleSelectSuggestion(suggestion)
                                          }
                                          className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-sky-50 hover:text-blue-700"
                                      >
                                          <FiSearch className="h-4 w-4 shrink-0 text-sky-500" />

                                          <span className="min-w-0 truncate">
                                              {suggestion}
                                          </span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}

                      {!query.trim() && recentSearches.length > 0 && (
                          <div>
                              <p className="px-3 py-2 text-xs font-bold uppercase text-slate-400">
                                  Recent Searches
                              </p>

                              <div className="space-y-1">
                                  {recentSearches.map((search, index) => (
                                      <button
                                          key={index}
                                          type="button"
                                          onClick={() =>
                                              handleSelectSuggestion(search)
                                          }
                                          className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-sky-50 hover:text-blue-700"
                                      >
                                          <FiClock className="h-4 w-4 shrink-0 text-sky-500" />

                                          <span className="min-w-0 truncate">
                                              {search}
                                          </span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}

                      {!query.trim() && recentSearches.length === 0 && (
                          <div>
                              <p className="px-3 py-2 text-xs font-bold uppercase text-slate-400">
                                  Trending
                              </p>

                              <div className="space-y-1">
                                  {trendingSearches.map((search, index) => (
                                      <button
                                          key={index}
                                          type="button"
                                          onClick={() =>
                                              handleSelectSuggestion(search)
                                          }
                                          className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-sky-50 hover:text-blue-700"
                                      >
                                          <FiTrendingUp className="h-4 w-4 shrink-0 text-blue-500" />

                                          <span className="min-w-0 truncate">
                                              {search}
                                          </span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>,
              document.body
          )
        : null;

    return (
        <>
            <div ref={wrapperRef} className="relative w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div
                        ref={inputContainerRef}
                        className={`relative overflow-hidden rounded-xl bg-white transition-all duration-200 ${
                            isFocused
                                ? 'ring-2 ring-sky-200 shadow-md shadow-sky-100'
                                : ''
                        }`}
                    >
                        <FiSearch
                            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                                isFocused
                                    ? 'text-blue-500'
                                    : 'text-slate-400'
                            }`}
                        />

                        <input
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            placeholder={placeholder || 'Search...'}
                            className="w-full rounded-xl border border-sky-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500"
                        />

                        {query && (
                            <button
                                type="button"
                                onClick={handleClear}
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-sky-50 hover:text-blue-600"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {dropdownContent}
        </>
    );
};

export default AdminSearchBar;


