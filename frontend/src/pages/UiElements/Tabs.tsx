import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TabExample from "../../components/ui/tabs";
import PageMeta from "../../components/common/PageMeta";

export default function Tabs() {
  return (
    <>
      <PageMeta
        title="React.js Spinners Tabs | SEQ.IST Demonstrator - React.js Admin Dashboard Template"
        description="This is React.js Tabs page for SEQ.IST Demonstrator - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tabs" />
      <TabExample />
    </>
  );
}
