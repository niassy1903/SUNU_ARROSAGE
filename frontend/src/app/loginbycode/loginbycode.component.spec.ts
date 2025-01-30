import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginbycodeComponent } from './loginbycode.component';

describe('LoginbycodeComponent', () => {
  let component: LoginbycodeComponent;
  let fixture: ComponentFixture<LoginbycodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginbycodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginbycodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
