import React from 'react';
import './FilterBar.css';

const FilterBar = ({ filterType, onFilterChange, searchQuery, onSearchChange }) => {
  const filters = [
    { id: 'all', label: 'All', icon: null },
    {
      id: 'word',
      label: 'Word',
      icon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20251008.001/assets/brand-icons/product/svg/word_16x1.svg'
    },
    {
      id: 'excel',
      label: 'Excel',
      icon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20251008.001/assets/brand-icons/product/svg/excel_16x1.svg'
    },
    {
      id: 'powerpoint',
      label: 'PowerPoint',
      icon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20251008.001/assets/brand-icons/product/svg/powerpoint_16x1.svg'
    },
    {
      id: 'onenote',
      label: 'OneNote',
      icon: 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20251008.001/assets/brand-icons/product/svg/onenote_16x1.svg'
    }
  ];

  return (
    <div className="filter-bar-container">
      <h1 className="filter-bar-title">Recent</h1>

      <div className="filter-bar-content">
        <div className="filter-buttons-group">
          {filters.map(filter => (
            <button
              key={filter.id}
              type="button"
              className={`filter-button ${filterType === filter.id ? 'filter-button-active' : ''}`}
              onClick={() => onFilterChange(filter.id)}
              aria-label={`Filter by ${filter.label} files`}
              title={`Filter by ${filter.label} files`}
            >
              {filter.icon && <img src={filter.icon} alt="" className="filter-button-icon" />}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-search-box">
        <input
          type="text"
          placeholder="Filter by name or person"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-search-input"
          aria-label="Filter by name or person"
        />
      </div>
    </div>
  );
};

export default FilterBar;
