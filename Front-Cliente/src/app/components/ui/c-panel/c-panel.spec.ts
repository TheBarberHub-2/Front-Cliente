import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPanel } from './c-panel';

describe('CPanel', () => {
  let component: CPanel;
  let fixture: ComponentFixture<CPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
