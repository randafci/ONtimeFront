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
      organizationList: {
        title: "المستخدمين المسؤولين",
        clearButton: "مسح",
        searchPlaceholder: "بحث...",
        headers: {
          fullName: "الاسم الكامل",
          email: "البريد الإلكتروني",
          phone: "رقم الهاتف", // <-- ADDED
          status: "الحالة" // <-- ADDED
        },
        paginatorReport: "عرض {first} إلى {last} من أصل {totalRecords} إدخالات", // <-- ADDED
        emptyMessage: "لم يتم العثور على مستخدمين مسؤولين", // <-- ADDED
        loadingMessage: "جاري تحميل المستخدمين المسؤولين...", // <-- ADDED
        statusValues: { // <-- ADDED
          active: "نشط",
          inactive: "غير نشط"
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
      organizationList: {
        title: "Admin Users",
        clearButton: "Clear",
        searchPlaceholder: "Search...",
        headers: {
          fullName: "Full Name",
          email: "Email",
          phone: "Phone", // <-- ADDED
          status: "Status" // <-- ADDED
        },
        paginatorReport: "Showing {first} to {last} of {totalRecords} entries", // <-- ADDED
        emptyMessage: "No admin users found", // <-- ADDED
        loadingMessage: "Loading admin users...", // <-- ADDED
        statusValues: { // <-- ADDED
          active: "Active",
          inactive: "Inactive"
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