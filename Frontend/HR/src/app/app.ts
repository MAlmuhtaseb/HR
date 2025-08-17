import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf, NgFor, NgClass, NgStyle } from '@angular/common';
import { RandomColor } from './directives/random-color';
import { FormsModule, FormGroup, FormControl, ReactiveFormsModule, FormControlName, Validators } from '@angular/forms';

@Component({ // Decorator
  selector: 'app-root',
  imports: [RouterOutlet, NgIf, NgFor, NgClass, NgStyle, RandomColor, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})// ts, html, css | Component
export class App {

  //  title : string= "Welcome to Angular From Typescript";
  //  num : number = 52.4549;
  //  bool : boolean = true;
  //  arr : string[] = ["one","two","three"];
  
  // students = [
  //   {name : 'stu_1', mark : 49},
  //   {name : 'stu_2', mark : 88},
  //   {name : 'stu_3', mark : 56},
  //   {name : 'stu_4', mark : 32},
  //   {name : 'stu_5', mark : 98},
  //   {name : 'stu_6', mark : 66},
  // ];

// Global Varibales
  // images = [
  //   "https://i0.wp.com/picjumbo.com/wp-content/uploads/beautiful-fall-nature-scenery-free-image.jpeg?w=2210&quality=70",
  //   "https://t3.ftcdn.net/jpg/02/70/35/00/360_F_270350073_WO6yQAdptEnAhYKM5GuA9035wbRnVJSr.jpg",
  //   "https://images.pexels.com/photos/26151151/pexels-photo-26151151/free-photo-of-night-sky-filled-with-stars-reflecting-in-the-lake.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
  // ];
  // currentIndex = 0;
  // disabledButton = false;
  // name = "Emp";


  // form = new FormGroup({
  //   name : new FormControl("Emp"),
  //   email : new FormControl(),
  //   phone : new FormControl(),
  // });

  // next(){
  //   // let temp = 5; // local varibale
  //   // temp = 10;
  //   if(this.currentIndex < this.images.length - 1){
  //     this.currentIndex++;
  //   }
  // }

  // previous(){
  //   if(this.currentIndex > 0){
  //     this.currentIndex--;
  //   }
  // }


   form = new FormGroup({
    name : new FormControl(null, Validators.required),
    email : new FormControl(null, [Validators.required, Validators.email]),
    phone : new FormControl(null, [Validators.required, Validators.minLength(9), Validators.maxLength(10)]),
    course : new FormControl(1, Validators.required)
  });


  courses = [
    {id: 1, name: "Asp.Net"},
    {id: 2, name: "Angular"},
    {id: 3, name: "Java"},
    {id: 4, name: "Python"}
  ];


  reset(){
    this.form.reset({
      course: 1
    });
  }


}
