import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import LinksExample from "../../components/links";
import PageMeta from "../../components/common/PageMeta";

export default function Links() {
  return (
    <>
      <PageMeta
        title="React.js Links Dashboard | SEQ.IST Demonstrator - React.js Admin Dashboard Template"
        description="This is React.js Links page for SEQ.IST Demonstrator - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Links" />
      <LinksExample />
    </>
  );
}
