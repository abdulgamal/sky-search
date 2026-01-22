import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container-custom py-8 md:py-12">
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 SkySearch. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Button variant="link" className="p-0 h-auto">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
