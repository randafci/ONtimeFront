import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  // Re-structure the DB to hold objects per language code
  private mockDb: { [key: string]: any } = {
    ar: {
      common: { // Reusable common keys
        yes: "نعم",
        no: "لا",
        error: "خطأ",
        success: "نجاح",
        delete: "حذف",
        backButton: "الرجوع"
      },
      theme: {
        dim: "ضبابي",
        dark: "مظلم",
      },
      organizations: {
        listPage: {
          title: "المنظمات",
          addButton: "إضافة منظمة",
          clearButton: "مسح",
          searchPlaceholder: "ابحث في المنظمات",
          paginatorReport: "عرض {first} إلى {last} من أصل {totalRecords} إدخالات",
          headers: {
            name: "الاسم",
            nameSE: "الاسم (SE)",
            status: "الحالة",
            createdDate: "تاريخ الإنشاء",
            actions: "الإجراءات"
          },
          statusValues: {
            active: "نشط",
            inactive: "غير نشط"
          },
          anyOption: "الكل",
          emptyMessage: "لم يتم العثور على منظمات.",
          loadingMessage: "جاري تحميل المنظمات...",
          deleteConfirm: "هل أنت متأكد أنك تريد حذف {name}؟",
          deleteSuccess: "تم حذف المنظمة بنجاح",
          deleteError: "فشل حذف المنظمة"
        },
        formPage: {
          addTitle: "إضافة منظمة",
          editTitle: "تعديل منظمة",
          labels: {
            name: "الاسم",
            nameSE: "الاسم (SE)"
          },
          buttons: {
            cancel: "إلغاء",
            save: "حفظ",
            update: "تحديث"
          },
          validation: {
            required: "هذا الحقل مطلوب"
          }
        }
      },
      rolesList: { // <-- ADD THIS NEW SECTION
        title: "قائمة الأدوار",
        createButton: "إنشاء",
        clearButton: "مسح",
        searchPlaceholder: "اكتب للبحث",
        headers: {
          name: "الاسم",
          isDefault: "افتراضي",
          isHR: "دور الموارد البشرية؟",
          actions: "الإجراءات"
        },
        actions: {
          systemUsers: "مستخدمي النظام",
          permissions: "الأذونات",
          edit: "تعديل",
          markAsDefault: "تعيين كافتراضي",
          unmarkAsDefault: "إلغاء تعيين كافتراضي",
          delete: "حذف"
        },
        common: {
          yes: "نعم",
          no: "لا"
        },
        messages: {
          noResults: "لم يتم العثور على نتائج",
          loading: "جاري تحميل البيانات..."
        }
      },
      addRole: {
        pageTitle: "إضافة دور",
        nameLabel: "الاسم",
        hrRoleLabel: "دور الموارد البشرية؟",
        addButton: "إضافة",
        addingButton: "جاري الإضافة...",
        messages: {
          success: "تمت إضافة الدور بنجاح!",
          fieldIsRequired: "هذا الحقل مطلوب",
          mustLessThan: "يجب أن يكون أقل من",
          characters: "حرف"
        }
      },
      editRole: {
        pageTitle: "تعديل الدور",
        saveButton: "حفظ التغييرات",
        savingButton: "جاري الحفظ...",
        defaultRoleLabel: "هل هو الدور الافتراضي؟", // For the checkbox in the edit form
        messages: {
            success: "تم تحديث الدور بنجاح!"
        }
      },
      departmentList: {
        title: "الأقسام",
        addButton: "إضافة قسم",
        clearButton: "مسح",
        searchPlaceholder: "ابحث في الأقسام",
        headers: {
          code: "الرمز",
          name: "الاسم",
          nameSE: "الاسم (SE)",
          parentDepartment: "القسم الأصل",
          departmentType: "نوع القسم",
          company: "الشركة",
          status: "الحالة",
          createdDate: "تاريخ الإنشاء",
          actions: "الإجراءات"
        },
        filters: {
          searchByCode: "بحث بالرمز",
          searchByName: "بحث بالاسم",
          searchByNameSE: "بحث بالاسم (SE)",
          searchByParent: "بحث بالقسم الأصل",
          searchByCompany: "بحث بالشركة",
          any: "أي",
          datePlaceholder: "شهر/يوم/سنة"
        },
        statusValues: {
          active: "نشط",
          inactive: "غير نشط"
        },
        messages: {
          empty: "لم يتم العثور على أقسام.",
          loading: "جاري تحميل بيانات الأقسام. يرجى الانتظار.",
          loadError: "فشل تحميل الأقسام",
          deleteConfirm: "هل أنت متأكد أنك تريد حذف القسم '${name}'؟",
          deleteHeader: "تأكيد الحذف"
        }
      },
      departmentForm: {
        title: {
          add: "إضافة قسم",
          edit: "تعديل قسم"
        },
        labels: {
          code: "الرمز",
          name: "الاسم",
          nameSE: "الاسم (SE)",
          organization: "المنظمة",
          departmentType: "نوع القسم",
          company: "الشركة",
          parentDepartment: "القسم الأصل"
        },
        placeholders: {
          selectOrganization: "اختر منظمة",
          selectDepartmentType: "اختر نوع القسم",
          selectCompany: "اختر شركة (اختياري)",
          selectParent: "اختر القسم الأصل"
        },
        buttons: {
          cancel: "إلغاء",
          update: "تحديث",
          save: "حفظ"
        },
        validation: {
          required: "هذا الحقل مطلوب"
        },
        toasts: {
          loadError: "فشل تحميل بيانات القسم",
          createSuccess: "تم إنشاء القسم بنجاح",
          createError: "فشل إنشاء القسم",
          updateSuccess: "تم تحديث القسم بنجاح",
          updateError: "فشل تحديث القسم"
        }
      },
      companies: {
        listPage: {
          title: "الشركات",
          addButton: "إضافة شركة",
          clearButton: "مسح",
          searchPlaceholder: "ابحث في الشركات",
          headers: {
            code: "الرمز",
            name: "الاسم",
            nameSE: "الاسم (SE)",
            parentCompany: "الشركة الأم",
            status: "الحالة",
            createdDate: "تاريخ الإنشاء",
            actions: "الإجراءات"
          },
          statuses: {
            active: "نشط",
            inactive: "غير نشط",
            any: "الكل"
          },
          emptyMessage: "لم يتم العثور على شركات.",
          loadingMessage: "جاري تحميل بيانات الشركات. الرجاء الانتظار."
        },
        formPage: {
          addTitle: "إضافة شركة",
          editTitle: "تعديل شركة",
          labels: {
            code: "الرمز",
            name: "الاسم",
            nameSE: "الاسم (SE)",
            organization: "المنظمة",
            companyType: "نوع الشركة",
            parentCompany: "الشركة الأم"
          },
          placeholders: {
            selectOrg: "اختر منظمة",
            selectType: "اختر نوع الشركة",
            selectParent: "اختر الشركة الأم"
          },
          buttons: {
            cancel: "إلغاء",
            save: "حفظ",
            update: "تحديث"
          },
          validation: {
            required: "هذا الحقل مطلوب"
          }
        }
      },
      users: {
        listPage: {
          title: "المستخدمون",
          addButton: "إضافة مستخدم",
          clearButton: "مسح",
          searchPlaceholder: "ابحث في المستخدمين",
          headers: {
            username: "اسم المستخدم",
            email: "البريد الإلكتروني",
            ldapUser: "مستخدم LDAP",
            actions: "الإجراءات"
          },
          filters: {
            searchByUsername: "بحث بالاسم",
            searchByEmail: "بحث بالبريد",
            any: "الكل"
          },
          messages: {
            empty: "لم يتم العثور على مستخدمين.",
            loading: "جاري تحميل بيانات المستخدمين...",
            deleteConfirm: "هل أنت متأكد أنك تريد حذف المستخدم {name}؟",
            deleteSuccess: "تم حذف المستخدم بنجاح",
            deleteError: "فشل حذف المستخدم",
            loadError: "فشل تحميل المستخدمين"
          }
        },
        formPage: {
          title: {
            add: "إضافة مستخدم",
            edit: "تعديل مستخدم"
          },
          labels: {
            userName: "اسم المستخدم",
            email: "البريد الإلكتروني",
            password: "كلمة المرور",
            isLdapUser: "مستخدم LDAP؟",
            extraEmployeesView: "عرض الموظفين الإضافيين",
            employee: "الموظف"
          },
          placeholders: {
            selectEmployee: "اختر موظف"
          },
          buttons: {
            cancel: "إلغاء",
            save: "حفظ",
            update: "تحديث"
          },
          validation: {
            required: "هذا الحقل مطلوب"
          }
        },
        common: {
          yes: "نعم",
          no: "لا",
          success: "نجاح",
          error: "خطأ",
          confirmDelete: "تأكيد الحذف"
        }
      },
      employees: {
        listPage: {
          title: "قائمة الموظفين",
          createButton: "إنشاء",
          clearButton: "مسح",
          searchPlaceholder: "ابحث في الموظفين...",
          headers: {
            employeeId: "معرف الموظف",
            employeeName: "اسم الموظف",
            jobTitle: "المسمى الوظيفي",
            department: "القسم",
            status: "الحالة",
            actions: "الإجراءات"
          },
          tooltips: {
            edit: "تعديل الموظف",
            delete: "حذف الموظف"
          },
          statuses: {
            active: "نشط",
            inactive: "غير نشط",
            onLeave: "في إجازة",
            terminated: "منتهية خدمته",
            suspended: "موقوف",
            probation: "تحت التجربة",
            any: "الكل"
          },
          messages: {
            empty: "لم يتم العثور على موظفين",
            loading: "جاري تحميل الموظفين...",
            deleteConfirm: "هل أنت متأكد أنك تريد حذف {name}؟",
            deleteSuccess: "تم حذف الموظف {name} بنجاح.",
            deleteError: "فشل حذف الموظف",
            deleteCancelled: "تم إلغاء عملية الحذف"
          }
        },
        formPage: {
          titles: {
            add: "إضافة موظف",
            edit: "تعديل موظف"
          },
          buttons: {
            back: "رجوع",
            cancel: "إلغاء",
            create: "إنشاء",
            update: "تحديث"
          },
          profile: {
            fullName: "الاسم الكامل",
            jobTitle: "المسمى الوظيفي",
            employeeId: "معرف الموظف",
            status: "الحالة"
          },
          tabs: {
            general: "عام",
            contact: "اتصال",
            organizational: "تنظيمي",
            documents: "مستندات",
            reportManagers: "المدراء المباشرون",
            assignSchedule: "تعيين جدول",
            policies: "السياسات"
          },
          general: {
            title: "معلومات عامة",
            employmentSection: "معلومات التوظيف",
            personalSection: "معلومات شخصية",
            displaySection: "إعدادات العرض",
            labels: {
              employeeId: "معرف الموظف",
              employeeStatus: "حالة الموظف",
              employeeType: "نوع الموظف",
              firstName: "الاسم الأول",
              familyName: "اسم العائلة",
              gender: "الجنس",
              nationality: "الجنسية",
              religion: "الديانة",
              specialNeeds: "احتياجات خاصة",
              enableSpecialNeeds: "تمكين الاحتياجات الخاصة",
              displayInReport: "عرض في التقرير",
              showInReports: "إظهار في التقارير",
              displayInDashboard: "عرض في لوحة المعلومات",
              showInDashboard: "إظهار في لوحة المعلومات"
            }
          },
          contact: {
            title: "تفاصيل الاتصال",
            personalSection: "جهة اتصال شخصية",
            officialSection: "جهة اتصال رسمية",
            addressSection: "معلومات العنوان",
            labels: {
                personalEmail: "البريد الإلكتروني الشخصي",
                personalPhone: "الهاتف الشخصي",
                personalMobile: "الجوال الشخصي",
                officialEmail: "البريد الإلكتروني الرسمي",
                officialPhone: "الهاتف الرسمي",
                officialMobile: "الجوال الرسمي",
                address: "العنوان",
                city: "المدينة",
                state: "المنطقة"
            }
          },
          documents: {
            title: "معلومات المستندات",
            labels: {
                passportNumber: "رقم جواز السفر",
                visaNumber: "رقم التأشيرة",
                passportExpiration: "تاريخ انتهاء جواز السفر",
                visaExpiration: "تاريخ انتهاء التأشيرة"
            }
          },
          placeholders: {
            selectGender: "اختر الجنس",
            selectStatus: "اختر الحالة"
          },
          validation: {
            required: "هذا الحقل مطلوب"
          }
        }
      }
    },
    en: {
      common: { // Reusable common keys
        yes: "Yes",
        no: "No",
        error: "Error",
        success: "Success",
        delete: "Delete",
        backButton: "Back"
      },
      theme: {
        dim: "Dim",
        dark: "Dark",
      },
      organizations: {
        listPage: {
          title: "Organizations",
          addButton: "Add Organization",
          clearButton: "Clear",
          searchPlaceholder: "Search organizations",
          paginatorReport: "Showing {first} to {last} of {totalRecords} entries",
          headers: {
            name: "Name",
            nameSE: "Name (SE)",
            status: "Status",
            createdDate: "Created Date",
            actions: "Actions"
          },
          statusValues: {
            active: "Active",
            inactive: "Inactive"
          },
          anyOption: "Any",
          emptyMessage: "No organizations found.",
          loadingMessage: "Loading organizations...",
          deleteConfirm: "Are you sure you want to delete {name}?",
          deleteSuccess: "Organization deleted successfully",
          deleteError: "Failed to delete organization"
        },
        formPage: {
          addTitle: "Add Organization",
          editTitle: "Edit Organization",
          labels: {
            name: "Name",
            nameSE: "Name (SE)"
          },
          buttons: {
            cancel: "Cancel",
            save: "Save",
            update: "Update"
          },
          validation: {
            required: "This field is required"
          }
        }
      },
      rolesList: { // <-- ADD THIS NEW SECTION
        title: "Roles List",
        createButton: "Create",
        clearButton: "Clear",
        searchPlaceholder: "Type to search",
        headers: {
          name: "Name",
          isDefault: "Default",
          isHR: "Is HR Role?",
          actions: "Actions"
        },
        actions: {
          systemUsers: "System Users",
          permissions: "Permissions",
          edit: "Edit",
          markAsDefault: "Mark as Default",
          unmarkAsDefault: "Unmark as Default",
          delete: "Delete"
        },
        common: {
          yes: "Yes",
          no: "No"
        },
        messages: {
          noResults: "No results found",
          loading: "Loading data..."
        }
      },
      addRole: {
        pageTitle: "Add Role",
        nameLabel: "Name",
        hrRoleLabel: "Is HR Role?",
        addButton: "Add",
        addingButton: "Adding...",
        messages: {
          success: "Role added successfully!",
          fieldIsRequired: "This field is required",
          mustLessThan: "Must be less than",
          characters: "characters"
        }
      },
      editRole: {
        pageTitle: "Edit Role",
        saveButton: "Save Changes",
        savingButton: "Saving...",
        defaultRoleLabel: "Is Default Role?", // For the checkbox in the edit form
        messages: {
            success: "Role updated successfully!"
        }
      },
      departmentList: {
        title: "Departments",
        addButton: "Add Department",
        clearButton: "Clear",
        searchPlaceholder: "Search departments",
        headers: {
          code: "Code",
          name: "Name",
          nameSE: "Name (SE)",
          parentDepartment: "Parent Department",
          departmentType: "Department Type",
          company: "Company",
          status: "Status",
          createdDate: "Created Date",
          actions: "Actions"
        },
        filters: {
          searchByCode: "Search by code",
          searchByName: "Search by name",
          searchByNameSE: "Search by name (SE)",
          searchByParent: "Search by parent",
          searchByCompany: "Search by company",
          any: "Any",
          datePlaceholder: "mm/dd/yyyy"
        },
        statusValues: {
          active: "Active",
          inactive: "Inactive"
        },
        messages: {
          empty: "No departments found.",
          loading: "Loading departments data. Please wait.",
          loadError: "Failed to load departments",
          deleteConfirm: "Are you sure you want to delete the department '${name}'?",
          deleteHeader: "Confirm Deletion"
        }
      },
      departmentForm: {
        title: {
          add: "Add Department",
          edit: "Edit Department"
        },
        labels: {
          code: "Code",
          name: "Name",
          nameSE: "Name (SE)",
          organization: "Organization",
          departmentType: "Department Type",
          company: "Company",
          parentDepartment: "Parent Department"
        },
        placeholders: {
          selectOrganization: "Select Organization",
          selectDepartmentType: "Select Department Type",
          selectCompany: "Select Company (Optional)",
          selectParent: "Select Parent Department"
        },
        buttons: {
          cancel: "Cancel",
          update: "Update",
          save: "Save"
        },
        validation: {
          required: "This field is required"
        },
        toasts: {
          loadError: "Failed to load department data",
          createSuccess: "Department created successfully",
          createError: "Failed to create department",
          updateSuccess: "Department updated successfully",
          updateError: "Failed to update department"
        }
      },
      companies: {
        listPage: {
          title: "Companies",
          addButton: "Add Company",
          clearButton: "Clear",
          searchPlaceholder: "Search companies",
          headers: {
            code: "Code",
            name: "Name",
            nameSE: "Name (SE)",
            parentCompany: "Parent Company",
            status: "Status",
            createdDate: "Created Date",
            actions: "Actions"
          },
          statuses: {
            active: "Active",
            inactive: "Inactive",
            any: "Any"
          },
          emptyMessage: "No companies found.",
          loadingMessage: "Loading companies data. Please wait."
        },
        formPage: {
          addTitle: "Add Company",
          editTitle: "Edit Company",
          labels: {
            code: "Code",
            name: "Name",
            nameSE: "Name (SE)",
            organization: "Organization",
            companyType: "Company Type",
            parentCompany: "Parent Company"
          },
          placeholders: {
            selectOrg: "Select Organization",
            selectType: "Select Company Type",
            selectParent: "Select Parent Company"
          },
          buttons: {
            cancel: "Cancel",
            save: "Save",
            update: "Update"
          },
          validation: {
            required: "This field is required"
          }
        }
      },
      users: {
        listPage: {
          title: "Users",
          addButton: "Add User",
          clearButton: "Clear",
          searchPlaceholder: "Search users",
          headers: {
            username: "Username",
            email: "Email",
            ldapUser: "LDAP User",
            actions: "Actions"
          },
          filters: {
            searchByUsername: "Search by username",
            searchByEmail: "Search by email",
            any: "Any"
          },
          messages: {
            empty: "No users found.",
            loading: "Loading users data...",
            deleteConfirm: "Are you sure you want to delete user {name}?",
            deleteSuccess: "User deleted successfully",
            deleteError: "Failed to delete user",
            loadError: "Failed to load users"
          }
        },
        formPage: {
          title: {
            add: "Add User",
            edit: "Edit User"
          },
          labels: {
            userName: "Username",
            email: "Email",
            password: "Password",
            isLdapUser: "Is LDAP User?",
            extraEmployeesView: "Extra Employees View",
            employee: "Employee"
          },
          placeholders: {
            selectEmployee: "Select Employee"
          },
          buttons: {
            cancel: "Cancel",
            save: "Save",
            update: "Update"
          },
          validation: {
            required: "This field is required"
          }
        },
        common: {
          yes: "Yes",
          no: "No",
          success: "Success",
          error: "Error",
          confirmDelete: "Confirm Deletion"
        }
      },
      employees: {
        listPage: {
          title: "Employee List",
          createButton: "Create",
          clearButton: "Clear",
          searchPlaceholder: "Search employees...",
          headers: {
            employeeId: "Employee ID",
            employeeName: "Employee Name",
            jobTitle: "Job Title",
            department: "Department",
            status: "Status",
            actions: "Actions"
          },
          tooltips: {
            edit: "Edit Employee",
            delete: "Delete Employee"
          },
          statuses: {
            active: "Active",
            inactive: "Inactive",
            onLeave: "On Leave",
            terminated: "Terminated",
            suspended: "Suspended",
            probation: "Probation",
            any: "Any"
          },
          messages: {
            empty: "No employees found",
            loading: "Loading employees...",
            deleteConfirm: "Are you sure you want to delete {name}?",
            deleteSuccess: "Employee {name} deleted successfully.",
            deleteError: "Failed to delete employee",
            deleteCancelled: "Delete operation cancelled"
          }
        },
        formPage: {
          titles: {
            add: "Add Employee",
            edit: "Edit Employee"
          },
          buttons: {
            back: "Back",
            cancel: "Cancel",
            create: "Create",
            update: "Update"
          },
          profile: {
            fullName: "Full Name",
            jobTitle: "Job Title",
            employeeId: "Employee ID",
            status: "Status"
          },
          tabs: {
            general: "General",
            contact: "Contact",
            organizational: "Organizational",
            documents: "Documents",
            reportManagers: "Report Managers",
            assignSchedule: "Assign Schedule",
            policies: "Policies"
          },
          general: {
            title: "General Information",
            employmentSection: "Employment Information",
            personalSection: "Personal Information",
            displaySection: "Display Settings",
            labels: {
              employeeId: "Employee ID",
              employeeStatus: "Employee Status",
              employeeType: "Employee Type",
              firstName: "First Name",
              familyName: "Family Name",
              gender: "Gender",
              nationality: "Nationality",
              religion: "Religion",
              specialNeeds: "Special Needs",
              enableSpecialNeeds: "Enable special needs",
              displayInReport: "Display in Report",
              showInReports: "Show in reports",
              displayInDashboard: "Display in Reports Dashboard",
              showInDashboard: "Show in dashboard"
            }
          },
          contact: {
            title: "Contact Details",
            personalSection: "Personal Contact",
            officialSection: "Official Contact",
            addressSection: "Address Information",
            labels: {
                personalEmail: "Personal Email",
                personalPhone: "Personal Phone",
                personalMobile: "Personal Mobile Phone",
                officialEmail: "Official Email",
                officialPhone: "Official Phone",
                officialMobile: "Official Mobile Phone",
                address: "Address",
                city: "City",
                state: "State"
            }
          },
          documents: {
            title: "Document Information",
            labels: {
                passportNumber: "Passport Number",
                visaNumber: "Visa Number",
                passportExpiration: "Passport Expiration Date",
                visaExpiration: "Visa Expiration Date"
            }
          },
          placeholders: {
            selectGender: "Select Gender",
            selectStatus: "Select Employee Status"
          },
          validation: {
            required: "This field is required"
          }
        }
      }
    }
  };
  // 1. A private BehaviorSubject to hold the CURRENT language's translations
  private translationsSubject = new BehaviorSubject<any>({});

  // 2. A public Observable that components and pipes can subscribe to
  public translations$ = this.translationsSubject.asObservable();

   // --- NEW ---
  // A new BehaviorSubject to hold the current language code ('ar' or 'en')
  private currentLangSubject = new BehaviorSubject<string>('ar');
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor() {
    // Load the default language when the service starts
    this.loadTranslations(this.currentLangSubject.getValue());
  }

  public loadTranslations(languageCode: string): void {
    console.log(`SERVICE: Loading new translations for [${languageCode}]...`);
    const data = this.mockDb[languageCode] || {};
    this.translationsSubject.next(data);
    // Also update the current language subject
    this.currentLangSubject.next(languageCode);
  }

  // --- NEW ---
  // A simple toggle method for components to call
  public toggleLanguage(): void {
    const currentLang = this.currentLangSubject.getValue();
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    this.loadTranslations(newLang);
  }

  public updateTranslations(languageCode: string, updatedTranslations: any): Observable<{ success: boolean }> {
    console.log(`SERVICE: Updating translations for [${languageCode}]...`);
    this.mockDb[languageCode] = updatedTranslations;
    this.loadTranslations(languageCode);
    return of({ success: true }).pipe(delay(1000));
  }
}