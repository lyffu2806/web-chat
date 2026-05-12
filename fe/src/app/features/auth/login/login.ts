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
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  form: FormGroup;
  showError = false;
  errorMessage = '';
  submitted = false;
  private sub!: Subscription;

  constructor(private fb: FormBuilder, private store: Store) {
    this.form = this.fb.group({
      username: ['', Validators.required], // ← đổi email → username
      password: ['', Validators.required],
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
    this.submitted = true;
    if (this.form.invalid) return;
    this.store.dispatch(AuthActions.login(this.form.value));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}