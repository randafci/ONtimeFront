import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

// Leaflet is loaded globally via CDN
declare var L: any;

interface MapCoordinates {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
  providers: [MessageService],
  template: `
    <div class="map-picker-container">
      <!-- Location Selection Button -->
      <div class="location-selector" *ngIf="!showMap">
        <div class="location-info-display">
          <div class="location-display" *ngIf="selectedCoordinates">
            <i class="pi pi-map-marker text-blue-500"></i>
            <div class="location-details">
              <div class="location-name">{{ searchQuery || 'Selected Location' }}</div>
              <div class="location-coords">
                Lat: {{ selectedCoordinates.lat | number:'1.4-4' }}, 
                Lng: {{ selectedCoordinates.lng | number:'1.4-4' }}
              </div>
            </div>
          </div>
          <div class="no-location" *ngIf="!selectedCoordinates">
            <i class="pi pi-map-marker text-gray-400"></i>
            <span>No location selected</span>
          </div>
        </div>
        
        <div class="location-actions">
          <button 
            pButton 
            label="Set Location" 
            icon="pi pi-map" 
            class="p-button-sm"
            (click)="openMap()">
          </button>
          <button 
            pButton 
            label="Use Current Location" 
            icon="pi pi-map-marker" 
            class="p-button-sm p-button-outlined"
            (click)="getCurrentLocation()"
            [loading]="gettingLocation">
          </button>
          <button 
            *ngIf="selectedCoordinates"
            pButton 
            label="Clear" 
            icon="pi pi-times" 
            class="p-button-sm p-button-secondary"
            (click)="clearSelection()">
          </button>
        </div>
      </div>

      <!-- Map Interface (Hidden by default) -->
      <div class="map-interface" *ngIf="showMap">
        <!-- Map Header with Search -->
        <div class="map-header">
          <div class="search-container">
            <div class="search-input-wrapper">
              <i class="pi pi-search search-icon"></i>
              <input 
                pInputText 
                [(ngModel)]="searchQuery"
                (keyup.enter)="searchLocation()"
                (input)="onSearchInput()"
                placeholder="Search for places, addresses, or landmarks..."
                class="search-input"
                [class.searching]="searching">
              <button 
                *ngIf="searchQuery"
                pButton 
                icon="pi pi-times" 
                class="p-button-text p-button-sm clear-search"
                (click)="clearSearch()">
              </button>
            </div>
            
            <!-- Search Results Dropdown -->
            <div class="search-results" *ngIf="showSearchResults && searchResults.length > 0">
              <div 
                *ngFor="let result of searchResults; let i = index"
                class="search-result-item"
                [class.selected]="i === selectedResultIndex"
                (click)="selectSearchResult(result)"
                (mouseenter)="selectedResultIndex = i">
                <div class="result-name">{{ result.display_name }}</div>
                <div class="result-type">{{ result.type }}</div>
              </div>
            </div>
          </div>
          
          <div class="map-controls">
            <button 
              pButton 
              icon="pi pi-map-marker" 
              class="p-button-sm p-button-outlined"
              (click)="getCurrentLocation()"
              [loading]="gettingLocation"
              pTooltip="Use Current Location"
              tooltipPosition="bottom">
            </button>
            <button 
              pButton 
              icon="pi pi-refresh" 
              class="p-button-sm p-button-outlined"
              (click)="resetMap()"
              pTooltip="Reset Map"
              tooltipPosition="bottom">
            </button>
            <button 
              pButton 
              label="Done" 
              icon="pi pi-check" 
              class="p-button-sm p-button-success"
              (click)="closeMap()"
              [disabled]="!selectedCoordinates">
            </button>
          </div>
        </div>

        <!-- Map Container -->
        <div class="map-wrapper">
          <div class="map-container" #mapContainer></div>
          
          <!-- Map Overlay Controls -->
          <div class="map-overlay">
            <div class="zoom-controls">
              <button class="zoom-btn" (click)="zoomIn()" title="Zoom In">
                <i class="pi pi-plus"></i>
              </button>
              <button class="zoom-btn" (click)="zoomOut()" title="Zoom Out">
                <i class="pi pi-minus"></i>
              </button>
            </div>
            
            <div class="location-info" *ngIf="selectedCoordinates">
              <div class="location-coords">
                <strong>Selected Location</strong>
                <div class="coords">
                  <span>Lat: {{ selectedCoordinates.lat | number:'1.6-6' }}</span>
                  <span>Lng: {{ selectedCoordinates.lng | number:'1.6-6' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coordinate Inputs (Always visible) -->
      <div class="coordinate-section">
        <button 
          class="toggle-coords"
          (click)="showCoordinateInputs = !showCoordinateInputs">
          <i class="pi" [class.pi-chevron-down]="!showCoordinateInputs" [class.pi-chevron-up]="showCoordinateInputs"></i>
          Manual Coordinates
        </button>
        
        <div class="coordinate-inputs" *ngIf="showCoordinateInputs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Latitude</label>
              <input 
                pInputText 
                [(ngModel)]="coordinates.lat" 
                (ngModelChange)="onCoordinateChange()"
                placeholder="Enter latitude"
                class="w-full"
                type="number"
                step="any">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Longitude</label>
              <input 
                pInputText 
                [(ngModel)]="coordinates.lng" 
                (ngModelChange)="onCoordinateChange()"
                placeholder="Enter longitude"
                class="w-full"
                type="number"
                step="any">
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-picker-container {
      width: 100%;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .location-selector {
      padding: 16px;
      background: white;
      border-radius: 8px;
    }
    
    .location-info-display {
      margin-bottom: 16px;
    }
    
    .location-display {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 6px;
    }
    
    .location-details {
      flex: 1;
    }
    
    .location-name {
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .location-coords {
      font-size: 12px;
      color: #6b7280;
    }
    
    .no-location {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      color: #6b7280;
    }
    
    .location-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .map-interface {
      display: flex;
      flex-direction: column;
      height: 600px;
    }
    
    .map-header {
      background: white;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .search-container {
      flex: 1;
      position: relative;
    }
    
    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .search-icon {
      position: absolute;
      left: 12px;
      color: #6b7280;
      z-index: 1;
    }
    
    .search-input {
      width: 100%;
      padding: 12px 16px 12px 40px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .search-input.searching {
      border-color: #3b82f6;
    }
    
    .clear-search {
      position: absolute;
      right: 8px;
      padding: 4px;
    }
    
    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .search-result-item {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.2s;
    }
    
    .search-result-item:hover,
    .search-result-item.selected {
      background-color: #f3f4f6;
    }
    
    .result-name {
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .result-type {
      font-size: 12px;
      color: #6b7280;
    }
    
    .map-controls {
      display: flex;
      gap: 8px;
    }
    
    .map-wrapper {
      position: relative;
      height: 500px;
    }
    
    .map-container {
      height: 100%;
      width: 100%;
      min-height: 400px;
      background-color: #f0f0f0;
    }
    
    .map-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1000;
    }
    
    .zoom-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .zoom-btn {
      width: 40px;
      height: 40px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      pointer-events: all;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    
    .zoom-btn:hover {
      background: #f8f9fa;
      border-color: #3b82f6;
    }
    
    .location-info {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      pointer-events: all;
    }
    
    .location-coords {
      font-size: 14px;
    }
    
    .coords {
      display: flex;
      gap: 16px;
      margin-top: 4px;
      font-size: 12px;
      color: #6b7280;
    }
    
    .coordinate-section {
      background: white;
      border-top: 1px solid #e5e7eb;
    }
    
    .toggle-coords {
      width: 100%;
      padding: 12px 16px;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #6b7280;
      transition: color 0.2s;
    }
    
    .toggle-coords:hover {
      color: #3b82f6;
    }
    
    .coordinate-inputs {
      padding: 16px;
      border-top: 1px solid #f3f4f6;
    }
    
    .leaflet-container {
      height: 100%;
      width: 100%;
      font-family: inherit;
    }
    
    .custom-marker {
      background: transparent !important;
      border: none !important;
    }
    
    .leaflet-popup-content {
      margin: 8px 12px;
      line-height: 1.4;
    }
    
    .leaflet-popup-content-wrapper {
      border-radius: 6px;
      box-shadow: 0 3px 14px rgba(0,0,0,0.4);
    }
  `]
})
export class MapPickerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() initialLat: number = 24.7136; // Default to Riyadh, Saudi Arabia
  @Input() initialLng: number = 46.6753;
  @Input() initialZoom: number = 10;
  @Input() selectedLat?: number;
  @Input() selectedLng?: number;

  @Output() coordinatesSelected = new EventEmitter<MapCoordinates>();
  @Output() coordinatesChanged = new EventEmitter<MapCoordinates>();

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  map: any;
  marker: any;
  selectedCoordinates: MapCoordinates | null = null;
  gettingLocation: boolean = false;
  searching: boolean = false;
  searchQuery: string = '';
  showSearchResults: boolean = false;
  searchResults: any[] = [];
  selectedResultIndex: number = -1;
  showCoordinateInputs: boolean = false;
  showMap: boolean = false;
  searchTimeout: any;
  
  coordinates: MapCoordinates = {
    lat: this.initialLat,
    lng: this.initialLng
  };

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    // Initialize coordinates with input values or defaults
    if (this.selectedLat !== undefined && this.selectedLng !== undefined) {
      this.coordinates = {
        lat: this.selectedLat,
        lng: this.selectedLng
      };
      this.selectedCoordinates = { ...this.coordinates };
    } else {
      this.coordinates = {
        lat: this.initialLat,
        lng: this.initialLng
      };
    }
  }

  ngAfterViewInit(): void {
    // Don't initialize map until it's needed
    // Map will be initialized when showMap becomes true
  }

  openMap(): void {
    this.showMap = true;
    // Wait for the DOM to update, then initialize map
    setTimeout(() => {
      this.waitForLeaflet();
    }, 200); // Increased delay to ensure DOM is ready
  }

  closeMap(): void {
    this.showMap = false;
    this.showSearchResults = false;
    this.searchResults = [];
  }

  private waitForLeaflet(): void {
    if (typeof L !== 'undefined') {
      this.initializeMap();
    } else {
      setTimeout(() => this.waitForLeaflet(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    if (typeof L === 'undefined') {
      this.messageService.add({
        severity: 'error',
        summary: 'Map Error',
        detail: 'Leaflet library not loaded. Please refresh the page.'
      });
      return;
    }

    if (!this.mapContainer?.nativeElement) {
      return;
    }

    if (this.map && this.map.remove) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }

    this.mapContainer.nativeElement.innerHTML = '';

    try {
      this.map = L.map(this.mapContainer.nativeElement, {
        zoomControl: false,
        attributionControl: true
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Map Error',
        detail: 'Failed to create map. Please try again.'
      });
      return;
    }

    try {
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      });
      
      tileLayer.addTo(this.map);
      
      tileLayer.on('tileerror', (e: any) => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Map Warning',
          detail: 'Some map tiles failed to load. Map may appear incomplete.'
        });
      });
      
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Map Error',
        detail: 'Failed to load map tiles. Please check your internet connection.'
      });
    }

    if (this.coordinates.lat && this.coordinates.lng && 
        !isNaN(this.coordinates.lat) && !isNaN(this.coordinates.lng)) {
      this.map.setView([this.coordinates.lat, this.coordinates.lng], this.initialZoom);
    } else {
      const defaultLat = 24.7136;
      const defaultLng = 46.6753;
      this.map.setView([defaultLat, defaultLng], this.initialZoom);
    }

    // Add click event listener
    this.map.on('click', (e: any) => {
      this.onMapClick(e);
    });

    // Add double-click to zoom
    this.map.on('dblclick', (e: any) => {
      this.map.zoomIn();
    });

    // Add keyboard navigation
    this.map.on('keypress', (e: any) => {
      if (e.originalEvent.key === '+') {
        this.map.zoomIn();
      } else if (e.originalEvent.key === '-') {
        this.map.zoomOut();
      }
    });

    const markerLat = this.coordinates.lat && !isNaN(this.coordinates.lat) ? this.coordinates.lat : 24.7136;
    const markerLng = this.coordinates.lng && !isNaN(this.coordinates.lng) ? this.coordinates.lng : 46.6753;
    
    try {
      const testMarker = L.marker([markerLat, markerLng]).addTo(this.map);
      testMarker.bindPopup('Map is working!<br>Click anywhere to select location.').openPopup();
    } catch (error) {
      // Silent fail for test marker
    }

    // Add marker if coordinates are provided and valid
    if (this.selectedLat !== undefined && this.selectedLng !== undefined && 
        !isNaN(this.selectedLat) && !isNaN(this.selectedLng)) {
      this.addMarker(this.selectedLat, this.selectedLng);
    }

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(true);
        this.map.setView([this.coordinates.lat, this.coordinates.lng], this.initialZoom);
        
        setTimeout(() => {
          if (this.map && this.mapContainer?.nativeElement) {
            const mapElement = this.mapContainer.nativeElement;
            const hasTiles = mapElement.querySelector('.leaflet-tile-pane .leaflet-tile');
            if (!hasTiles) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Map Loading',
                detail: 'Map tiles are loading slowly. Please wait...'
              });
            }
          }
        }, 2000);
      }
    }, 100);
  }

  private onMapClick(e: any): void {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    this.coordinates = { lat, lng };
    this.selectedCoordinates = { lat, lng };
    
    this.addMarker(lat, lng);
    this.coordinatesSelected.emit({ lat, lng });
    this.coordinatesChanged.emit({ lat, lng });
    
    // Get address for the clicked location
    this.getAddressFromCoordinates(lat, lng);
  }

  private addMarker(lat: number, lng: number): void {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return;
    }

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    try {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      this.marker = L.marker([lat, lng], {
        draggable: true,
        icon: customIcon
      }).addTo(this.map);
    } catch (error) {
      return;
    }

    // Add popup with coordinates
    this.marker.bindPopup(`
      <div style="text-align: center;">
        <strong>Selected Location</strong><br>
        <small>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</small>
      </div>
    `);

    // Add drag event listener
    this.marker.on('dragend', (e: any) => {
      const newLat = e.target.getLatLng().lat;
      const newLng = e.target.getLatLng().lng;
      
      this.coordinates = { lat: newLat, lng: newLng };
      this.selectedCoordinates = { lat: newLat, lng: newLng };
      this.coordinatesChanged.emit({ lat: newLat, lng: newLng });
      
      // Update popup
      this.marker.setPopupContent(`
        <div style="text-align: center;">
          <strong>Selected Location</strong><br>
          <small>Lat: ${newLat.toFixed(6)}<br>Lng: ${newLng.toFixed(6)}</small>
        </div>
      `);
    });

    // Center map on marker with appropriate zoom
    this.map.setView([lat, lng], Math.max(this.map.getZoom(), 15));
  }

  onCoordinateChange(): void {
    if (this.coordinates.lat && this.coordinates.lng && 
        !isNaN(this.coordinates.lat) && !isNaN(this.coordinates.lng)) {
      this.selectedCoordinates = { ...this.coordinates };
      if (this.showMap && this.map) {
        this.addMarker(this.coordinates.lat, this.coordinates.lng);
      }
      this.coordinatesChanged.emit({ ...this.coordinates });
    }
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    this.gettingLocation = true;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        
        this.coordinates = { lat, lng };
        this.selectedCoordinates = { lat, lng };
        
        // If map is open, add marker and update view
        if (this.showMap && this.map) {
          this.addMarker(lat, lng);
          this.map.setView([lat, lng], this.map.getZoom());
        }
        
        this.coordinatesSelected.emit({ lat, lng });
        this.coordinatesChanged.emit({ lat, lng });
        
        this.gettingLocation = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Current location detected successfully.'
        });
      },
      (error) => {
        this.gettingLocation = false;
        
        let errorMessage = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    if (this.searchQuery.length > 2) {
      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 300);
    } else {
      this.showSearchResults = false;
      this.searchResults = [];
    }
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.showSearchResults = false;
      return;
    }

    this.searching = true;
    this.showSearchResults = true;
    
    // Use Nominatim (OpenStreetMap) geocoding service with more results
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=5&addressdetails=1&extratags=1`;
    
    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        this.searching = false;
        this.searchResults = data || [];
        this.selectedResultIndex = -1;
      })
      .catch(error => {
        this.searching = false;
        console.error('Geocoding error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to search for location. Please try again.'
        });
      });
  }

  selectSearchResult(result: any): void {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    this.coordinates = { lat, lng };
    this.selectedCoordinates = { lat, lng };
    this.addMarker(lat, lng);
    this.coordinatesSelected.emit({ lat, lng });
    this.coordinatesChanged.emit({ lat, lng });
    
    this.searchQuery = result.display_name;
    this.showSearchResults = false;
    this.searchResults = [];
    
    this.messageService.add({
      severity: 'success',
      summary: 'Location Selected',
      detail: result.display_name
    });
  }

  searchLocation(): void {
    if (!this.searchQuery.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter a location to search for.'
      });
      return;
    }

    this.performSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchResults = [];
    this.selectedResultIndex = -1;
  }

  zoomIn(): void {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut(): void {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  resetMap(): void {
    if (this.map) {
      this.map.setView([this.initialLat, this.initialLng], this.initialZoom);
    }
  }

  clearSelection(): void {
    this.coordinates = { lat: this.initialLat, lng: this.initialLng };
    this.selectedCoordinates = null;
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchResults = [];
    
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    
    this.map.setView([this.initialLat, this.initialLng], this.initialZoom);
    this.coordinatesChanged.emit({ lat: this.initialLat, lng: this.initialLng });
  }

  getSelectedCoordinates(): MapCoordinates | null {
    return this.selectedCoordinates;
  }

  // Reverse geocoding - get address from coordinates
  getAddressFromCoordinates(lat: number, lng: number): void {
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    
    fetch(reverseUrl)
      .then(response => response.json())
      .then(data => {
        if (data && data.display_name) {
          this.searchQuery = data.display_name;
          this.messageService.add({
            severity: 'info',
            summary: 'Location Found',
            detail: data.display_name
          });
        }
      })
      .catch(error => {
        console.error('Reverse geocoding error:', error);
      });
  }
}
