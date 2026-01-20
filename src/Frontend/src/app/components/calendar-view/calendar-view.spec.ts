import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarViewComponent } from './calendar-view';

describe('CalendarViewComponent', () => {
  let component: CalendarViewComponent;
  let fixture: ComponentFixture<CalendarViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current date', () => {
    expect(component.currentDate).toBeDefined();
    expect(component.currentDate instanceof Date).toBeTruthy();
  });

  it('should have 7 weekday labels', () => {
    expect(component.weekDays.length).toBe(7);
    expect(component.weekDays[0]).toBe('Sun');
    expect(component.weekDays[6]).toBe('Sat');
  });

  it('should generate calendar days when applications change', () => {
    const mockApplications = [
      {
        id: 1,
        position: 'Developer',
        companyName: 'Test Co',
        status: 0,
        appliedAt: '2026-01-19T10:00:00Z',
      },
    ];

    component.applications = mockApplications as any;
    component.ngOnChanges({
      applications: {
        currentValue: mockApplications,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.calendarDays.length).toBeGreaterThan(0);
  });

  it('should navigate to previous month', () => {
    const currentMonth = component.currentDate.getMonth();
    component.previousMonth();
    expect(component.currentDate.getMonth()).toBe((currentMonth - 1 + 12) % 12);
  });

  it('should navigate to next month', () => {
    const currentMonth = component.currentDate.getMonth();
    component.nextMonth();
    expect(component.currentDate.getMonth()).toBe((currentMonth + 1) % 12);
  });

  it('should go to today', () => {
    jasmine.clock().install();
    const fixedDate = new Date(2026, 0, 20); // January 20, 2026
    jasmine.clock().mockDate(fixedDate);

    component.currentDate = new Date(2025, 0, 1); // January 2025
    component.goToToday();

    expect(component.currentDate.getMonth()).toBe(0); // January
    expect(component.currentDate.getFullYear()).toBe(2026);

    jasmine.clock().uninstall();
  });

  it('should format month and year correctly', () => {
    component.currentDate = new Date(2026, 0, 15); // January 15, 2026
    const monthYear = component.getMonthYearString();
    expect(monthYear).toContain('January');
    expect(monthYear).toContain('2026');
  });

  it('should get correct status color', () => {
    const blueColor = component.getStatusColor(0); // Applied
    const greenColor = component.getStatusColor(3); // Offer
    const redColor = component.getStatusColor(2); // Rejected

    expect(blueColor).toContain('blue');
    expect(greenColor).toContain('green');
    expect(redColor).toContain('red');
  });

  it('should get status label correctly', () => {
    expect(component.getStatusLabel(0)).toBe('Applied');
    expect(component.getStatusLabel(1)).toBe('Interviewing');
    expect(component.getStatusLabel(3)).toBe('Offer');
    expect(component.getStatusLabel(4)).toBe('PhoneScreen');
  });

  it('should format dates correctly', () => {
    const dateString = '2026-01-19T10:30:00Z';
    const formatted = component.formatDate(dateString);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('19');
    expect(formatted).toContain('2026');
  });

  it('should get correct count indicator color', () => {
    expect(component.getCountIndicatorColor(0)).toBe('');
    expect(component.getCountIndicatorColor(1)).toBe('bg-blue-400');
    expect(component.getCountIndicatorColor(2)).toBe('bg-yellow-400');
    expect(component.getCountIndicatorColor(3)).toBe('bg-red-400');
  });

  it('should select day when clicked', () => {
    const mockDay = {
      date: new Date(),
      isCurrentMonth: true,
      isToday: true,
      applications: [
        {
          id: 1,
          position: 'Test',
          companyName: 'Test Co',
          status: 0,
          appliedAt: '2026-01-19',
        },
      ] as any,
    };

    component.onDayClick(mockDay);
    expect(component.selectedDay).toBe(mockDay);
  });

  it('should not select day with no applications', () => {
    const mockDay = {
      date: new Date(),
      isCurrentMonth: true,
      isToday: false,
      applications: [],
    };

    component.selectedDay = null;
    component.onDayClick(mockDay);
    expect(component.selectedDay).toBeNull();
  });

  it('should close detail modal', () => {
    const mockDay = {
      date: new Date(),
      isCurrentMonth: true,
      isToday: true,
      applications: [{ id: 1 } as any],
    };

    component.selectedDay = mockDay;
    component.closeDetail();
    expect(component.selectedDay).toBeNull();
  });
});
