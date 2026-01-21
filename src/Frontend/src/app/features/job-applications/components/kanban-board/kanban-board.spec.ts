import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { KanbanBoardComponent } from './kanban-board';

describe('KanbanBoardComponent', () => {
  let component: KanbanBoardComponent;
  let fixture: ComponentFixture<KanbanBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanBoardComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty applications', () => {
    expect(component['_applications']).toEqual([]);
  });

  it('should have 7 status columns', () => {
    expect(component.columns.length).toBe(7);
  });

  it('should organize applications by status', () => {
    const mockApplications = [
      {
        id: 1,
        position: 'Frontend Developer',
        companyName: 'Test Company',
        status: 0, // Applied
        appliedAt: '2026-01-19',
      },
      {
        id: 2,
        position: 'Backend Developer',
        companyName: 'Another Company',
        status: 4, // PhoneScreen
        appliedAt: '2026-01-18',
      },
    ];

    component.applications = mockApplications as any;

    // Check if applications are distributed to correct columns
    const appliedColumn = component.columns.find((col) => col.id === 'applied');
    const phoneScreenColumn = component.columns.find((col) => col.id === 'phone-screen');

    expect(appliedColumn?.applications.length).toBe(1);
    expect(phoneScreenColumn?.applications.length).toBe(1);
  });

  it('should format dates correctly', () => {
    const dateString = '2026-01-19T10:30:00Z';
    const formatted = component.formatDate(dateString);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('19');
    expect(formatted).toContain('2026');
  });

  it('should return connected list IDs', () => {
    const connectedLists = component.getConnectedLists();
    expect(connectedLists.length).toBe(7);
    expect(connectedLists).toContain('applied');
    expect(connectedLists).toContain('phone-screen');
    expect(connectedLists).toContain('offer');
  });
});
