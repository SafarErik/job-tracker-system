import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JobForm } from './job-form';

describe('JobForm', () => {
  let component: JobForm;
  let fixture: ComponentFixture<JobForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobForm, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(JobForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
