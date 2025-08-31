import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Employee } from '../../interfaces/employee-interface';
import { ConfirmationDialog } from '../../shared-components/confirmation-dialog/confirmation-dialog';
import { EmployeesService } from '../../services/employees.service';
import { List } from '../../interfaces/list-interface';
@Component({
  selector: 'app-employees',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, ConfirmationDialog],
  providers: [DatePipe], // Depndency Injcution
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit  {

  @ViewChild ('closeButton') closeButton: ElementRef | undefined;// Get Element By ID

  employees : Employee[] = [];

  employeesTableColumns: string[] = ["#", "Name", "Phone", "Birthdate","Status", "Start Date", "Position", "Department", "Manager"];

  departments = [
    {id: null, name: "Select Department"},
    {id: 1, name:"HR"},
    {id: 2, name:"IT"}
  ];

  positions = [
    {id: null, name: "Select Position"},
    {id:1, name: "Manager"},
    {id:2, name: "Developer"},
    {id:3, name: "HR"}
  ];

  managers : List[] = [];


  employeeForm : FormGroup = new FormGroup({
    Id: new FormControl(null),
    Name: new FormControl(null, [Validators.required]),
    Phone: new FormControl(null, [Validators.required]),
    Birthdate: new FormControl(null, [Validators.required]),
    StartDate: new FormControl(null, [Validators.required]),
    Department: new FormControl(null, [Validators.required]),
    Manager: new FormControl(null),
    Position: new FormControl(null, [Validators.required]),
    IsActive: new FormControl(true, [Validators.required])
  });

  paginationConfig = { itemsPerPage: 5, currentPage: 1};

  deleteDialogTitle : string = "Delete Confirmation";
  deleteDialogBody : string = "Are you sure you want to delete this employee?";
  showConfirmationDialog : boolean = false;
  employeeIdToBeDeleted : number | null = null;

  constructor(private _datePipe: DatePipe,
    private _employeeService : EmployeesService
  ){

  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadManagersList();
  }
  
  ngOnDestroy(){
    console.log("Component Detroyed");
  }

  

  loadEmployees(){
    this.employees = [];

   this._employeeService.getAll().subscribe(
    {
      next : (res : any) => { // Succesful Request
        if(res?.length > 0){
          
          res.forEach((x : any) => {
            let employee : Employee = {
              id: x.id,
              name: x.name,
              phone: x.phone,
              birthdate: x.birthDate,
              isActive: x.isActive,
              startDate: x.startDate,
              positionId: x.positionId,
              positionName: x.positionName,
              departmentId: x.departmentId,
              departmentName: x.departmentName,
              managerId: x.managerId,
              managerName: x.managerName
            };
            this.employees.push(employee);
          });
        }
        else{
        }
      },
      error : err => { // Failed Request | 400, 500
        console.log(err.message);
      }
    }
   );
  }

  loadManagersList(employeeId?:number){
    this.managers = [
      {id: null, name: "Select Manager"}
    ];

    this._employeeService.getManagers().subscribe({
      next: (res : any) =>{
        if(res?.length > 0){
          res.forEach((x : any)=>{
            let manager : List = {id: x.id, name: x.name};
            this.managers.push(manager);
          })
        }
      },
      error : err => {
        console.log(err.message);
      }
    })
  }


  saveEmployee(){

    if(!this.employeeForm.value.Id){// Add Employee
    let newEmp : Employee = {
      id: this.employees[this.employees.length - 1].id + 1,
      name: this.employeeForm.value.Name,
      phone: this.employeeForm.value.Phone,
      birthdate: this.employeeForm.value.Birthdate,
      startDate: this.employeeForm.value.StartDate,
      isActive: this.employeeForm.value.IsActive,
      departmentId: this.employeeForm.value.Department,
      departmentName: this.departments.find(x => x.id == this.employeeForm.value.Department)?.name,
      managerId: this.employeeForm.value.Manager,
      managerName: this.employeeForm.value.Manager? this.managers.find(x => x.id == this.employeeForm.value.Manager)?.name : null,
      positionId: this.employeeForm.value.Position,
      positionName: this.positions.find(x => x.id == this.employeeForm.value.Position)?.name
    };

    this.employees.push(newEmp);
    }
    else{// Edit Employee
      let index = this.employees.findIndex(x => x.id == this.employeeForm.value.Id);// Returns the index


      this.employees[index].name = this.employeeForm.value.Name;
      this.employees[index].phone = this.employeeForm.value.Phone;
      this.employees[index].birthdate = this.employeeForm.value.Birthdate;
      this.employees[index].isActive = this.employeeForm.value.IsActive;
      this.employees[index].startDate = this.employeeForm.value.StartDate;
      this.employees[index].departmentId = this.employeeForm.value.Department;
      this.employees[index].departmentName =  this.departments.find(x => x.id == this.employeeForm.value.Department)?.name;
      this.employees[index].positionId = this.employeeForm.value.Position;
      this.employees[index].positionName = this.positions.find(x => x.id == this.employeeForm.value.Position)?.name;
      this.employees[index].managerId = this.employeeForm.value.Manager;
      this.employees[index].managerName =  this.employeeForm.value.Manager? this.managers.find(x => x.id == this.employeeForm.value.Manager)?.name : null;

    }


    this.closeButton?.nativeElement.click();
    this.clearEmployeeForm();
  }

  clearEmployeeForm(){

    this.employeeForm.reset({
      IsActive: true
    });
  }


  editEmployee(id: number){
    let employee = this.employees.find(x => x.id == id);

    if(employee != null){
      this.employeeForm.patchValue({
        Id: employee?.id,
        Name: employee?.name,
        Phone: employee?.phone,
        StartDate: this._datePipe.transform(employee?.startDate, 'yyyy-MM-dd'), // yyyy-mm-dd 2025-07-05
        Birthdate: this._datePipe.transform(employee?.birthdate, 'yyyy-MM-dd'),
        Department: employee?.departmentId,
        Manager: employee?.managerId,
        Position: employee?.positionId,
        IsActive: employee?.isActive
      })
    }
  }


  removeEmployee(){
    this.employees = this.employees.filter(x => x.id !== this.employeeIdToBeDeleted);

    // let index = this.employees.findIndex(x => x.id === id);
    // this.employees.splice(index, 1);
  }


  changePage(pageNumber : number){
    this.paginationConfig.currentPage = pageNumber;
  }


  showConfirmDialog(empId : number){
    this.employeeIdToBeDeleted = empId; // save employee id to be used later
    this.showConfirmationDialog = true; // show confirmation dialog
  }

  confrimEmployeeDelete(isConfirmed : boolean){
    if(isConfirmed){
      this.removeEmployee();
    }

    this.employeeIdToBeDeleted = null; // remove saved employee id
    this.showConfirmationDialog = false; // hide confirmation dialog
  }

}

