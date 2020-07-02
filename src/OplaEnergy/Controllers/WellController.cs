using Microsoft.AspNetCore.Mvc;

namespace OplaEnergy.Controllers
{
    public class WellController : Controller
    {
        [Route("well-info")]
        public ViewResult Info()
        {
            return View();
        }

        [Route("well-control-streaming")]
        public ViewResult ControlStreaming()
        {
            ViewBag.Mode = ControlScreenMode.Streaming;
            return View("Control", true);
        }

        [Route("well-control-historical")]
        public ViewResult ControlHistorical()
        {
            ViewBag.Mode = ControlScreenMode.Historical;
            return View("Control", false);
        }
    }
}
