import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PopoverExample from "../../components/ui/popover";

export default function Popovers() {
  return (
    <div>
      <PageMeta
        title="React.js List Popover | SEQ.IST Demonstrator - React.js Admin Dashboard Template"
        description="This is React.js Popover  page for SEQ.IST Demonstrator - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Popovers" />
      <PopoverExample />
    </div>
  );
}
