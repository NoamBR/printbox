import { CsvUploader } from "@/components/panel/CsvUploader";
import { QuickAddProspect } from "@/components/panel/QuickAddProspect";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl text-brand-bone">הוספת לידים</h1>
        <p className="text-brand-boneDim text-sm mt-1">
          הוסף ליד בודד בטופס למטה, או העלה קובץ CSV לטעינה מרובה. כפילויות לפי אימייל ידולגו.
        </p>
      </div>

      <QuickAddProspect />

      <div className="border-t border-brand-line pt-8 space-y-4">
        <div>
          <h2 className="font-serif text-xl text-brand-bone">ייבוא CSV</h2>
          <p className="text-brand-boneDim text-xs mt-1">
            שדות חובה:{" "}
            <code className="text-brand-goldHi">company_name</code>,{" "}
            <code className="text-brand-goldHi">industry_he</code>,{" "}
            <code className="text-brand-goldHi">first_name</code>,{" "}
            <code className="text-brand-goldHi">email</code>,{" "}
            <code className="text-brand-goldHi">city</code>.
          </p>
        </div>
        <CsvUploader />
        <div className="bg-brand-surface border border-brand-line rounded-lg p-4 text-xs text-brand-boneDim">
          <div className="text-brand-bone font-medium mb-1">דוגמה לשורת CSV:</div>
          <code className="block bg-brand-noir/50 p-2 rounded text-brand-goldHi overflow-x-auto whitespace-pre">
            company_name,industry_he,first_name,last_name,role,email,phone,city,website,notes
            {"\n"}"קפה לורן","בית קפה בוטיק","מאיה","כהן","בעלים","maya@cafe.example","052-0000001","תל אביב","",""
          </code>
        </div>
      </div>
    </div>
  );
}
