import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthError } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit, OnDestroy {
  form: FormGroup;
  showError = false;
  errorMessage = '';
  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private store: Store,
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.sub = this.store
      .select(selectAuthError)
      .pipe(filter((err) => !!err))
      .subscribe((err) => {
        this.errorMessage = err!;
        this.showError = true;
      });
  }

  closeError() {
    this.showError = false;
  }

  onSubmit() {
    if (this.form.valid) {
      this.store.dispatch(AuthActions.register(this.form.value));
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
