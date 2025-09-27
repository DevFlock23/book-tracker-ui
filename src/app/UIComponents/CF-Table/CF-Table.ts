import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges, TemplateRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';

export interface CFTableColumn {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'custom';
}

export interface CFTableConfig {
  columns: CFTableColumn[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  height?: string;
}

@Component({
  selector: 'cf-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './CF-Table.html',
  styleUrls: ['./CF-Table.scss']
})
export class CFTableComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: any[] = [];
  @Input() config!: CFTableConfig;
  @Input() loading = false;
  @Input() customTemplates: { [key: string]: TemplateRef<any> } = {};
  
  @Output() rowAction = new EventEmitter<{action: string, row: any}>();
  @Output() searchChange = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tableWrapper') tableWrapper!: ElementRef<HTMLElement>;
  @ViewChild('headerSection') headerSection!: ElementRef<HTMLElement>;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  columnWidths: { [key: string]: number } = {};
  calculatedColumnWidths: { [key: string]: string } = {};
  isTableResizing = false;

  private readonly DEFAULT_COLUMN_WIDTH = 150;
  private readonly MIN_COLUMN_WIDTH = 80;
  private readonly SCROLLBAR_WIDTH = 17;
  
  private resizeAnimationFrame: number | null = null;
  private resizeObserver?: ResizeObserver;
  private initTimeout?: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.dataSource.data = this.data;
      
      // Check for scrollbar after data is loaded
      setTimeout(() => {
        this.updateColumnWidths();
      }, 100);
    }
    
    if (changes['config'] && this.config) {
      this.setupTable();
    }
  }

  ngAfterViewInit(): void {
    this.setupPagination();
    this.initializeColumnResize();
    this.setupResizeObserver();
    this.setupScrollSync(); // Add this
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  applyFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;
    
    const filterValue = target.value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    this.searchChange.emit(filterValue);
  }

  getColumnWidth(columnKey: string): string {
    return this.calculatedColumnWidths[columnKey] || `${this.DEFAULT_COLUMN_WIDTH}px`;
  }

  getColumnConfig(columnKey: string): CFTableColumn | undefined {
    return this.config?.columns.find(col => col.key === columnKey);
  }

  getCustomTemplate(columnKey: string): TemplateRef<any> | null {
    return this.customTemplates[columnKey] || null;
  }

  onRowAction(action: string, row: any): void {
    this.rowAction.emit({ action, row });
  }

  private setupTable(): void {
    if (!this.config?.columns) return;
    
    this.displayedColumns = this.config.columns.map(col => col.key);
    this.initializeColumnWidths();
  }

  private initializeColumnWidths(): void {
    this.config.columns.forEach(col => {
      const width = col.width || this.DEFAULT_COLUMN_WIDTH;
      this.columnWidths[col.key] = width;
      this.calculatedColumnWidths[col.key] = `${width}px`;
    });
  }

  private setupPagination(): void {
    if (this.config?.showPagination && this.paginator) {
      this.dataSource.paginator = this.paginator;
      
      // Listen to pagination changes to update scrollbar compensation
      this.paginator.page.subscribe(() => {
        setTimeout(() => {
          this.updateColumnWidths();
        }, 50);
      });
    }
  }

  private initializeColumnResize(): void {
    this.initTimeout = window.setTimeout(() => {
      this.updateColumnWidths();
    }, 200);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined' && this.tableWrapper) {
      this.resizeObserver = new ResizeObserver(() => {
        this.debounceUpdateColumnWidths();
      });
      this.resizeObserver.observe(this.tableWrapper.nativeElement);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', this.debounceUpdateColumnWidths.bind(this));
    }
  }

  private setupScrollSync(): void {
    const headerSection = this.headerSection?.nativeElement;
    const bodySection = this.tableWrapper?.nativeElement;
    
    if (headerSection && bodySection) {
      // Sync header scroll with body scroll
      bodySection.addEventListener('scroll', () => {
        headerSection.scrollLeft = bodySection.scrollLeft;
      });
    }
  }

  private debounceUpdateColumnWidths = (() => {
    let timeout: number;
    return () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => this.updateColumnWidths(), 150);
    };
  })();

  private updateColumnWidths(): void {
    const bodySection = this.tableWrapper?.nativeElement;
    const headerSection = this.headerSection?.nativeElement;
    
    if (!bodySection || !headerSection) return;

    const availableWidth = this.calculateAvailableWidth(bodySection);
    const lastColumnWidth = this.calculateLastColumnWidth(availableWidth);

    this.updateCalculatedWidths(lastColumnWidth);
    
    // Calculate the actual total width of all columns
    const actualTotalWidth = this.displayedColumns
      .reduce((sum, col) => sum + parseInt(this.calculatedColumnWidths[col]), 0);
    
    this.applyWidthsToElements(bodySection, headerSection, actualTotalWidth);
  }

  private calculateAvailableWidth(bodySection: HTMLElement): number {
    const containerWidth = bodySection.clientWidth;
    const hasVerticalScrollbar = bodySection.scrollHeight > bodySection.clientHeight;
    const scrollbarWidth = hasVerticalScrollbar ? this.SCROLLBAR_WIDTH : 0;
    
    return containerWidth - scrollbarWidth;
  }

  private calculateLastColumnWidth(availableWidth: number): number {
    const totalFixedWidth = this.displayedColumns
      .slice(0, -1)
      .reduce((sum, col) => sum + this.columnWidths[col], 0);
    
    const calculatedWidth = availableWidth - totalFixedWidth;
    
    // Get the configured width for the last column
    const lastColumnKey = this.displayedColumns[this.displayedColumns.length - 1];
    const configuredWidth = this.columnWidths[lastColumnKey] || this.DEFAULT_COLUMN_WIDTH;

    // Use the larger of: configured width, calculated available space, or minimum width
    return Math.max(this.DEFAULT_COLUMN_WIDTH, configuredWidth, calculatedWidth);
  }

  private updateCalculatedWidths(lastColumnWidth: number): void {
    this.displayedColumns.forEach((columnKey, index) => {
      const isLastColumn = index === this.displayedColumns.length - 1;
      const width = isLastColumn ? lastColumnWidth : this.columnWidths[columnKey];
      this.calculatedColumnWidths[columnKey] = `${width}px`;
    });
  }

  private applyWidthsToElements(bodySection: HTMLElement, headerSection: HTMLElement, totalWidth: number): void {
    const headerCells = headerSection.querySelectorAll('.cf-header-cell');
    const bodyRows = bodySection.querySelectorAll('.mat-mdc-row');
    const containerWidth = bodySection.clientWidth;
    const hasExtraSpace = totalWidth <= containerWidth;
    
    // Check if vertical scrollbar is present
    const hasVerticalScrollbar = bodySection.scrollHeight > bodySection.clientHeight;
    
    this.displayedColumns.forEach((columnName, index) => {
      const width = parseInt(this.calculatedColumnWidths[columnName]);
      const isLastColumn = index === this.displayedColumns.length - 1;
      
      // Update header cell
      if (headerCells[index]) {
        this.setElementWidth(headerCells[index] as HTMLElement, width);
      }
      
      // Update body cells
      bodyRows.forEach((row: Element) => {
        const cells = row.querySelectorAll('.mat-mdc-cell');
        if (cells[index]) {
          const cell = cells[index] as HTMLElement;
          this.setElementWidth(cell, width);
          
          // Apply appropriate classes for last column ellipsis behavior
          if (isLastColumn) {
            if (hasExtraSpace) {
              cell.classList.add('has-space');
              cell.classList.remove('constrained');
            } else {
              cell.classList.add('constrained');
              cell.classList.remove('has-space');
            }
          }
        }
      });
    });

    // Apply scrollbar compensation
    this.applyScrollbarCompensation(headerSection, hasVerticalScrollbar);

    // Update table widths
    this.updateTableWidths(headerSection, bodySection, totalWidth);
  }

  private applyScrollbarCompensation(headerSection: HTMLElement, hasVerticalScrollbar: boolean): void {
    if (hasVerticalScrollbar) {
      headerSection.classList.add('has-vertical-scrollbar');
    } else {
      headerSection.classList.remove('has-vertical-scrollbar');
    }
  }

  private updateTableWidths(headerSection: HTMLElement, bodySection: HTMLElement, totalWidth: number): void {
    const headerTable = headerSection.querySelector('.cf-header-table') as HTMLElement;
    const bodyTable = bodySection.querySelector('.cf-body-table') as HTMLElement;
    
    const containerWidth = bodySection.clientWidth;
    const shouldSetWidth = totalWidth > containerWidth;
    if (headerTable) {
        if (shouldSetWidth) {
        this.setElementWidth(headerTable, totalWidth);
        } else {
        // Let table auto-size to container
        headerTable.style.width = '100%';
        headerTable.style.minWidth = '';
        headerTable.style.maxWidth = '';
        }
    }
    
    if (bodyTable) {
        if (shouldSetWidth) {
        this.setElementWidth(bodyTable, totalWidth);
        } else {
        // Let table auto-size to container
        bodyTable.style.width = '100%';
        bodyTable.style.minWidth = '';
        bodyTable.style.maxWidth = '';
        }
    }
  }

  private setElementWidth(element: HTMLElement, width: number): void {
    const widthPx = `${width}px`;
    element.style.width = widthPx;
    element.style.minWidth = widthPx;
    element.style.maxWidth = widthPx;
  }

  startResize(event: MouseEvent, columnKey: string): void {
    event.preventDefault();
    event.stopPropagation();
    
    const startX = event.clientX;
    const startWidth = this.columnWidths[columnKey];
    
    this.setResizingState(true);
    
    const handleMouseMove = (e: MouseEvent) => this.handleResize(e, startX, startWidth, columnKey);
    const handleMouseUp = () => this.handleResizeEnd(handleMouseMove, handleMouseUp);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  private handleResize(e: MouseEvent, startX: number, startWidth: number, columnName: string): void {
    if (this.resizeAnimationFrame) {
      cancelAnimationFrame(this.resizeAnimationFrame);
    }

    const diff = e.clientX - startX;
    const columnConfig = this.getColumnConfig(columnName);
    const minWidth = columnConfig?.minWidth || this.MIN_COLUMN_WIDTH;
    const newWidth = Math.max(minWidth, startWidth + diff);
    
    this.columnWidths[columnName] = newWidth;
    
    this.resizeAnimationFrame = requestAnimationFrame(() => {
      this.updateColumnWidths();
      this.resizeAnimationFrame = null;
    });
  }

  private handleResizeEnd(mouseMoveHandler: (e: MouseEvent) => void, mouseUpHandler: () => void): void {
    this.setResizingState(false);
    
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  }

  private setResizingState(isResizing: boolean): void {
    this.isTableResizing = isResizing;
  }

  private cleanup(): void {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
    }
    
    if (this.resizeAnimationFrame) {
      cancelAnimationFrame(this.resizeAnimationFrame);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Clean up event listeners
    window.removeEventListener('resize', this.debounceUpdateColumnWidths);
    
    // Clean up scroll sync listener
    const bodySection = this.tableWrapper?.nativeElement;
    if (bodySection) {
      bodySection.removeEventListener('scroll', this.syncHeaderScroll);
    }
  }

  // Store the scroll handler as a method for proper cleanup
  private syncHeaderScroll = () => {
    const headerSection = this.headerSection?.nativeElement;
    const bodySection = this.tableWrapper?.nativeElement;
    
    if (headerSection && bodySection) {
      headerSection.scrollLeft = bodySection.scrollLeft;
    }
  }
}